import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

const transactionRequestPayload: tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest = {
  transactionRequestId: '7d34f91d-d078-4077-8263-2c047876fcf6',
  payee: {
    partyIdInfo: {
      partyIdType: 'MSISDN',
      partyIdentifier: '+44 1234 5678',
      fspId: 'dfspb'
    }
  },
  payer: {
    partyIdType: 'THIRD_PARTY_LINK',
    partyIdentifier: 'qwerty-123456',
    fspId: 'dfspa'
  },
  amountType: 'SEND',
  amount: {
    amount: '100',
    currency: 'USD'
  },
  transactionType: {
    scenario: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER'
  },
  expiration: '2020-07-15T22:17:28.985-01:00'
}

export const transactionRequest = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {},
  payload: transactionRequestPayload
}

export const getTransactionRequest = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {
    ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802'
  },
  payload: {}
}

const updateTransactionRequestPayload: tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPutResponse = {
  transactionId: '8e34f91d-d078-4077-8263-2c047876fcf6',
  transactionRequestState: 'RECEIVED'
}

export const updateTransactionRequest = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802'
  },
  payload: updateTransactionRequestPayload
}

const patchThirdpartyTransactionIdRequestPayload: tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPatchResponse = {
  transactionRequestState: 'ACCEPTED',
  transactionState: 'COMPLETED'
}

export const patchThirdpartyTransactionIdRequest = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802'
  },
  payload: patchThirdpartyTransactionIdRequestPayload
}

export const internalConfig = {
  options: {
    mode: 2,
    batchSize: 1,
    pollFrequency: 10,
    recursiveTimeout: 100,
    messageCharset: 'utf8',
    messageAsJSON: true,
    sync: true,
    consumeTimeout: 1000
  },
  rdkafkaConf: {
    'client.id': 'ml-con-notification-event',
    'group.id': 'ml-group-notification-event',
    'metadata.broker.list': 'localhost:9092',
    'socket.keepalive.enable': true
  },
  topicConf: {
    'auto.offset.reset': 'earliest'
  }
}

export const notificationEventCommit = {
  value: {
    from: 'dfspb',
    to: 'dfspa',
    id: 'bc1a9c36-4429-4205-8553-11f92de1919e',
    content: {
      uriParams: {
        id: 'bc1a9c36-4429-4205-8553-11f92de1919e'
      },
      headers: {
        'content-type': 'application/vnd.interoperability.transfers+jsonversion=1.0',
        date: '2020-09-09T03:58:36.000Z',
        'fspiop-source': 'dfspb',
        'fspiop-destination': 'dfspa',
        authorization: 'Bearer 74b241a2-4200-3938-8dfc-0e26ba21dc22',
        'content-length': '136',
        host: 'ml-api-adapter:3000',
        connection: 'close'
      },
      payload:
        'data:application/vnd.interoperability.transfers+jsonversion=1.0base64,eyJjb21wbGV0ZWRUaW1lc3RhbXAiOiIyMDIwLTA5LTA5VDAzOjU4OjM2Ljg0NFoiLCJ0cmFuc2ZlclN0YXRlIjoiQ09NTUlUVEVEIiwiZnVsZmlsbWVudCI6Ii1TODBPZ0pMbEpSVElHUFAxMlpZTnFjZEhLQlQ3WHNVZDFjenVOMUI5RzQifQ'
    },
    type: 'application/json',
    metadata: {
      correlationId: 'bc1a9c36-4429-4205-8553-11f92de1919e',
      event: {
        type: 'notification',
        action: 'commit',
        createdAt: '2020-09-09T03:58:36.859Z',
        state: {
          status: 'success',
          code: 0,
          description: 'action successful'
        },
        id: '85756a1d-c159-4316-b8d0-d0a41ecbcfe1',
        responseTo: '0ecc24f8-a617-4b60-b954-3cfb4b909ae8'
      },
      trace: {
        startTimestamp: '2020-09-09T03:58:36.932Z',
        service: 'cl_transfer_position',
        traceId: 'f67d1328e258e8fba2dacbbed098be48',
        spanId: '0b142ddb9e695312',
        parentSpanId: 'e933005ac5ade0c6',
        tags: {
          tracestate: 'acmevendor=eyJzcGFuSWQiOiIwYjE0MmRkYjllNjk1MzEyIiwidGltZUFwaUZ1bGZpbCI6IjE1OTk2MjM5MTY4NTcifQ==',
          transactionType: 'transfer',
          transactionAction: 'fulfil',
          transactionId: 'bc1a9c36-4429-4205-8553-11f92de1919e',
          source: 'dfspb',
          destination: 'dfspa'
        },
        tracestates: {
          acmevendor: {
            spanId: '0b142ddb9e695312',
            timeApiFulfil: '1599623916857'
          }
        }
      },
      'protocol.createdAt': 1599623916963
    }
  }
}

export const notificationEventTransactionCommit = {
  value: {
    from: 'Hub',
    to: 'pispA',
    id: 'abcd-1234',
    content: {
      uriParams: {
        id: 'bc1a9c36-4429-4205-8553-11f92de1919e'
      },
      headers: {
        'content-type': 'application/vnd.interoperability.transfers+jsonversion=1.0',
        date: '2020-09-09T03:58:36.000Z',
        'fspiop-source': 'Hub',
        'fspiop-destination': 'pispA',
        authorization: 'Bearer 74b241a2-4200-3938-8dfc-0e26ba21dc22',
        'content-length': '136',
        host: 'ml-api-adapter:3000',
        connection: 'close'
      },
      payload:
        'data:application/vnd.interoperability.transfers+jsonversion=1.0base64,eyJjb21wbGV0ZWRUaW1lc3RhbXAiOiIyMDIwLTA5LTA5VDAzOjU4OjM2Ljg0NFoiLCJ0cmFuc2ZlclN0YXRlIjoiQ09NTUlUVEVEIiwiZnVsZmlsbWVudCI6Ii1TODBPZ0pMbEpSVElHUFAxMlpZTnFjZEhLQlQ3WHNVZDFjenVOMUI5RzQifQ'
    },
    type: 'application/json',
    metadata: {
      correlationId: 'bc1a9c36-4429-4205-8553-11f92de1919e',
      event: {
        type: 'notification',
        action: 'commit',
        createdAt: '2020-09-09T03:58:36.859Z',
        state: {
          status: 'success',
          code: 0,
          description: 'action successful'
        },
        id: '85756a1d-c159-4316-b8d0-d0a41ecbcfe1',
        responseTo: '0ecc24f8-a617-4b60-b954-3cfb4b909ae8'
      },
      trace: {
        startTimestamp: '2020-09-09T03:58:36.932Z',
        service: 'cl_transfer_position',
        traceId: 'f67d1328e258e8fba2dacbbed098be48',
        spanId: '0b142ddb9e695312',
        parentSpanId: 'e933005ac5ade0c6',
        tags: {
          tracestate: 'acmevendor=eyJzcGFuSWQiOiIwYjE0MmRkYjllNjk1MzEyIiwidGltZUFwaUZ1bGZpbCI6IjE1OTk2MjM5MTY4NTcifQ==',
          transactionType: 'transfer',
          transactionAction: 'fulfil',
          transactionId: 'bc1a9c36-4429-4205-8553-11f92de1919e',
          source: 'dfspb',
          destination: 'dfspa'
        },
        tracestates: {
          acmevendor: {
            spanId: '0b142ddb9e695312',
            timeApiFulfil: '1599623916857'
          }
        }
      },
      'protocol.createdAt': 1599623916963
    }
  }
}

const consentRequestsPostRequestPayload: tpAPI.Schemas.ConsentRequestsPostRequest = {
  consentRequestId: 'b82348b9-81f6-42ea-b5c4-80667d5740fe',
  userId: 'dfspa.username',
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    },
    {
      address: 'dfspa.username.5678',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ],
  authChannels: ['WEB', 'OTP'],
  callbackUri: 'pisp-app://callback.com'
}

export const consentRequestsPostRequest = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {},
  payload: consentRequestsPostRequestPayload
}

const consentRequestsPutRequestWebPayload: tpAPI.Schemas.ConsentRequestsIDPutResponseWeb = {
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    },
    {
      address: 'dfspa.username.5678',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ],
  authChannels: ['WEB'],
  callbackUri: 'pisp-app://callback.com',
  authUri: 'dfspa.com/authorize?consentRequestsId=b82348b9-81f6-42ea-b5c4-80667d5740fe'
}

export const consentRequestsPutRequestWeb = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {},
  payload: consentRequestsPutRequestWebPayload
}

const consentRequestsPutRequestOTPPayload: tpAPI.Schemas.ConsentRequestsIDPutResponseOTP = {
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    },
    {
      address: 'dfspa.username.5678',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ],
  authChannels: ['OTP'],
  callbackUri: 'pisp-app://callback.com'
}

export const consentRequestsPutRequestOTP = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {},
  payload: consentRequestsPutRequestOTPPayload
}

const consentsPostRequestPISPPayload: tpAPI.Schemas.ConsentsPostRequestPISP = {
  status: 'ISSUED',
  consentId: '7b24ea42-6fdd-45f5-999e-0a6981c4198b',
  consentRequestId: '1b07d64d-ec7d-4582-989b-b6d7608e4218',
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ]
}

export const consentsPostRequestPISP = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {},
  payload: consentsPostRequestPISPPayload
}

const consentsPostRequestAUTHPayload: tpAPI.Schemas.ConsentsPostRequestAUTH = {
  status: 'ISSUED',
  consentId: '7b24ea42-6fdd-45f5-999e-0a6981c4198b',
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ],
  credential: {
    credentialType: 'FIDO',
    status: 'PENDING',
    fidoPayload: {
      id: 'credential id: identifier of pair of keys, base64 encoded, min length 59',
      rawId: 'raw credential id: identifier of pair of keys, base64 encoded, min length 59',
      response: {
        clientDataJSON:
          'clientDataJSON-must-not-have-fewer-than-121-characters Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        attestationObject:
          'attestationObject-must-not-have-fewer-than-306-characters Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
      },
      type: 'public-key'
    }
  }
}

export const consentsPostRequestAUTH = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'central-auth'
  },
  params: {},
  payload: consentsPostRequestAUTHPayload
}

const consentsIdPutRequestSignedPayload: tpAPI.Schemas.ConsentsIDPutResponseSigned = {
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    },
    {
      address: 'dfspa.username.5678',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ],
  credential: {
    credentialType: 'FIDO',
    status: 'PENDING',
    fidoPayload: {
      id: 'credential id: identifier of pair of keys, base64 encoded, min length 59',
      rawId: 'raw credential id: identifier of pair of keys, base64 encoded, min length 59',
      response: {
        clientDataJSON:
          'clientDataJSON-must-not-have-fewer-than-121-characters Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        attestationObject:
          'attestationObject-must-not-have-fewer-than-306-characters Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
      },
      type: 'public-key'
    }
  }
}

export const consentsIdPutRequestSigned = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'auth.dfspA'
  },
  params: {
    ID: '1b07d64d-ec7d-4582-989b-b6d7608e4218'
  },
  payload: consentsIdPutRequestSignedPayload
}

const consentsIdPutRequestVerifiedPayload: tpAPI.Schemas.ConsentsIDPutResponseVerified = {
  scopes: [
    {
      address: 'dfspa.username.1234',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    },
    {
      address: 'dfspa.username.5678',
      actions: ['ACCOUNTS_TRANSFER', 'ACCOUNTS_GET_BALANCE']
    }
  ],
  credential: {
    credentialType: 'FIDO',
    status: 'VERIFIED',
    fidoPayload: {
      id: 'credential id: identifier of pair of keys, base64 encoded, min length 59',
      rawId: 'raw credential id: identifier of pair of keys, base64 encoded, min length 59',
      response: {
        clientDataJSON:
          'clientDataJSON-must-not-have-fewer-than-121-characters Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        attestationObject:
          'attestationObject-must-not-have-fewer-than-306-characters Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
      },
      type: 'public-key'
    }
  }
}

export const consentsIdPutRequestVerified = {
  headers: {
    'fspiop-source': 'auth.dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: '1b07d64d-ec7d-4582-989b-b6d7608e4218'
  },
  payload: consentsIdPutRequestVerifiedPayload
}

export const genericThirdpartyError = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'a5bbfd51-d9fc-4084-961a-c2c2221a31e0'
  },
  payload: {
    errorInformation: {
      errorCode: '6000',
      errorDescription: 'Generic third party error',
      extensionList: {
        extension: [
          {
            key: 'test',
            value: 'test'
          }
        ]
      }
    }
  }
}

const accountsRequestPayload: tpAPI.Schemas.AccountsIDPutResponse = {
  accounts: [
    {
      accountNickname: 'dfspa.user.nickname1',
      address: 'dfspa.username.1234',
      currency: 'ZAR'
    },
    {
      accountNickname: 'dfspa.user.nickname2',
      address: 'dfspa.username.5678',
      currency: 'USD'
    }
  ]
}

export const accountsRequest = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {
    ID: 'username1234'
  },
  payload: accountsRequestPayload
}

export const accountsRequestError = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {
    ID: 'username1234'
  },
  payload: {
    errorInformation: {
      errorCode: '6000',
      errorDescription: 'Generic accounts error',
      extensionList: {
        extension: [
          {
            key: 'test.k',
            value: 'test.v'
          }
        ]
      }
    }
  }
}

const consentRequestsPatchPayload: tpAPI.Schemas.ConsentRequestsIDPatchRequest = {
  authToken: '141321'
}
export const consentRequestsPatch = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {},
  payload: consentRequestsPatchPayload
}

export const consentRequestsThirdpartyError = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'a5bbfd51-d9fc-4084-961a-c2c2221a31e0'
  },
  payload: {
    errorInformation: {
      errorCode: '6000',
      errorDescription: 'Generic third party error',
      extensionList: {
        extension: [
          {
            key: 'test',
            value: 'test'
          }
        ]
      }
    }
  }
}

export const consentsThirdpartyError = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'a5bbfd51-d9fc-4084-961a-c2c2221a31e0'
  },
  payload: {
    errorInformation: {
      errorCode: '6000',
      errorDescription: 'Generic third party error',
      extensionList: {
        extension: [
          {
            key: 'test',
            value: 'test'
          }
        ]
      }
    }
  }
}

export const getServicesByServiceTypeRequest = {
  headers: {
    'fspiop-source': 'pispA'
  },
  params: {
    ServiceType: 'THIRD_PARTY_DFSP'
  },
  payload: {}
}

const putServicesByServiceTypeRequestPayload: tpAPI.Schemas.ServicesServiceTypePutResponse = {
  providers: ['dfspa', 'dfspb']
}

export const putServicesByServiceTypeRequest = {
  headers: {
    'fspiop-source': 'switch',
    'fspiop-destination': 'pispA'
  },
  params: {
    ServiceType: 'THIRD_PARTY_DFSP'
  },
  payload: putServicesByServiceTypeRequestPayload
}

export const putServicesByServiceTypeRequestError = {
  headers: {
    'fspiop-source': 'switch',
    'fspiop-destination': 'pispA'
  },
  params: {
    ServiceType: 'THIRD_PARTY_DFSP'
  },
  payload: {
    errorInformation: {
      errorCode: '7201',
      errorDescription: 'No thirdparty enabled FSP found',
      extensionList: {
        extension: [
          {
            key: 'test',
            value: 'test'
          }
        ]
      }
    }
  }
}

const patchConsentsByIdRequestVerifiedPayload: tpAPI.Schemas.ConsentsIDPatchResponseVerified = {
  credential: {
    status: 'VERIFIED'
  }
}

export const patchConsentsByIdRequestVerified = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'a5bbfd51-d9fc-4084-961a-c2c2221a31e0'
  },
  payload: patchConsentsByIdRequestVerifiedPayload
}

const patchConsentsByIdRequestRevokedPayload: tpAPI.Schemas.ConsentsIDPatchResponseRevoked = {
  status: 'REVOKED',
  revokedAt: ''
}

export const patchConsentsByIdRequestRevoked = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {
    ID: 'a5bbfd51-d9fc-4084-961a-c2c2221a31e0'
  },
  payload: patchConsentsByIdRequestRevokedPayload
}
