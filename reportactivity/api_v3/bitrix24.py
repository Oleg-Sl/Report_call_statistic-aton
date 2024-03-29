#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Wrapper over Bitrix24 cloud API"""
import time
from json import loads
from logging import info
from time import sleep
from requests import adapters, post, exceptions
from multidimensional_urlencode import urlencode

# Retries for API request
adapters.DEFAULT_RETRIES = 10

import os
import json
import logging

from django.conf import settings
from . import service


logger_bx = logging.getLogger('bx24')
logger_bx.setLevel(logging.INFO)
fh_bx = logging.handlers.TimedRotatingFileHandler('./logs/bx24.log', when='D', interval=1, encoding="cp1251", backupCount=15)
formatter_bx = logging.Formatter('[%(asctime)s] %(levelname).1s %(message)s')
fh_bx.setFormatter(formatter_bx)
logger_bx.addHandler(fh_bx)


class Bitrix24:
    api_url = 'https://%s/rest/%s.json'
    oauth_url = 'https://oauth.bitrix.info/oauth/token/'
    timeout = 60

    def __init__(self):
        """Create Bitrix24 API object
        :param domain: str Bitrix24 domain
        :param auth_token: str Auth token
        :param refresh_token: str Refresh token
        :param client_id: str Client ID for refreshing access tokens
        :param client_secret: str Client secret for refreshing access tokens
        """

        token_data = service.get_token()
        self.domain = token_data.get("domain", None)
        self.auth_token = token_data.get("auth_token", None)
        self.refresh_token = token_data.get("refresh_token", None)
        settings = service.get_settings_app()
        self.client_id = settings.get("client_id", None)
        self.client_secret = settings.get("client_secret", None)

    def call(self, method, params1=None, params2=None, params3=None, params4=None):
        """Call Bitrix24 API method
        :param method: Method name
        :param params1: Method parameters 1
        :param params2: Method parameters 2. Needed for methods with determinate consequence of parameters
        :param params3: Method parameters 3. Needed for methods with determinate consequence of parameters
        :param params4: Method parameters 4. Needed for methods with determinate consequence of parameters
        :return: Call result
        """
        time_start = time.time()
        if method == '' or not isinstance(method, str):
            raise Exception('Empty Method')

        if method == 'batch' and 'prepared' not in params1:
            params1['cmd'] = self.prepare_batch(params1['cmd'])
            params1['prepared'] = True

        encoded_parameters = ''

        for i in [params1, params2, params3, params4, {'auth': self.auth_token}]:
            if i is not None:
                if 'cmd' in i:
                    i = dict(i)
                    encoded_parameters += self.encode_cmd(i['cmd']) + '&' + urlencode({'halt': i['halt']}) + '&'
                else:
                    encoded_parameters += urlencode(i) + '&'

        r = {}

        try:
            # request url
            url = self.api_url % (self.domain, method)

            print("url = ", url)
            print("encoded_parameters = ", encoded_parameters)
            # Make API request
            r = post(url, data=encoded_parameters, timeout=self.timeout)
            # Decode response
            result = loads(r.text)
        except ValueError:
            result = dict(error='Error on decode api response [%s]' % r.text)
        except exceptions.ReadTimeout:
            result = dict(error='Timeout waiting expired [%s sec]' % str(self.timeout))
        except exceptions.ConnectionError:
            result = dict(error='Max retries exceeded [' + str(adapters.DEFAULT_RETRIES) + ']')

        time_end = time.time()

        if 'error' in result and result['error'] in ('NO_AUTH_FOUND', 'expired_token'):
            result = self.refresh_tokens()
            if result is not True:
                logger_bx.error({
                    'error': 'Не удалось обновить токены доступа',
                    'result': result
                })
                return result
            # Repeat API request after renew token
            result = self.call(method, params1, params2, params3, params4)
        elif 'error' in result and result['error'] in ['QUERY_LIMIT_EXCEEDED', ]:
            sleep(2)
            logger_bx.warning({
                'warning': 'Ошибка получения данных, повтореый запрос через 2 секунды',
                'result': result
            })
            return self.call(method, params1, params2, params3, params4)

        duration = time_end - time_start
        logger_bx.info({
            'method': method,
            'duration_request': duration,
            'result': result if duration > 2 else ""
        })
        return result

    def refresh_tokens(self):
        """Refresh access tokens
        :return:
        """
        r = {}
        try:
            # Make call to oauth server
            r = post(
                self.oauth_url,
                params={'grant_type': 'refresh_token', 'client_id': self.client_id, 'client_secret': self.client_secret,
                        'refresh_token': self.refresh_token})
            result = loads(r.text)

            # Renew access tokens
            self.auth_token = result['access_token']
            self.refresh_token = result['refresh_token']
            self.expires_in = result['expires_in']
            service.update_tokens_in_file(self.auth_token, self.expires_in, self.refresh_token)

            info(['Tokens', self.auth_token, self.refresh_token])
            return True
        except (ValueError, KeyError):
            result = dict(error='Error on decode oauth response [%s]' % r.text)
            return result

    # def get_tokens(self):
    #     """Get access tokens
    #     :return: dict
    #     """
    #     return {'auth_token': self.auth_token, 'refresh_token': self.refresh_token}

    @staticmethod
    def prepare_batch(params):
        """
        Prepare methods for batch call
        :param params: dict
        :return: dict
        """
        if not isinstance(params, dict):
            raise Exception('Invalid \'cmd\' structure')

        batched_params = dict()

        for call_id in sorted(params.keys()):
            if not isinstance(params[call_id], list):
                raise Exception('Invalid \'cmd\' method description')
            method = params[call_id].pop(0)
            if method == 'batch':
                raise Exception('Batch call cannot contain batch methods')
            temp = ''
            for i in params[call_id]:
                temp += urlencode(i) + '&'
            batched_params[call_id] = method + '?' + temp

        return batched_params

    @staticmethod
    def encode_cmd(cmd):
        """Resort batch cmd by request keys and encode it
        :param cmd: dict List methods for batch request with request ids
        :return: str
        """
        cmd_encoded = ''

        for i in sorted(cmd.keys()):
            cmd_encoded += urlencode({'cmd': {i: cmd[i]}}) + '&'

        return cmd_encoded

    def batch(self, params):
        """Batch calling without limits. Method automatically prepare method for batch calling
        :param params:
        :return:
        """
        if 'halt' not in params or 'cmd' not in params:
            return dict(error='Invalid batch structure')

        result = dict()

        result['result'] = dict(
            result_error={},
            result_total={},
            result={},
            result_next={},
        )
        count = 0
        batch = dict()
        for request_id in sorted(params['cmd'].keys()):
            batch[request_id] = params['cmd'][request_id]
            count += 1
            if len(batch) == 49 or count == len(params['cmd']):
                temp = self.call('batch', {'halt': params['halt'], 'cmd': batch})
                for i in temp['result']:
                    if len(temp['result'][i]) > 0:
                        result['result'][i] = self.merge_two_dicts(temp['result'][i], result['result'][i])
                batch = dict()

        return result

    @staticmethod
    def merge_two_dicts(x, y):
        """Given two dicts, merge them into a new dict as a shallow copy."""
        z = x.copy()
        z.update(y)
        return z



