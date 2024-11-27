export const zklinkAcrossChainAbi = [
  {
    inputs: [
      {
        internalType: 'contract IPermit2',
        name: '_permit2',
        type: 'address',
      },
      {
        internalType: 'uint32',
        name: '_depositQuoteTimeBuffer',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: '_fillDeadlineBuffer',
        type: 'uint32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'DisabledRoute',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExpiredFillDeadline',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidExclusiveRelayer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFillDeadline',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidQuoteTimestamp',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotExclusiveRelayer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RelayFilled',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WrongChainId',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WrongERC7683OrderId',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WrongExclusiveRelayer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WrongOrderDataType',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WrongSettlementContract',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'originToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'destinationChainId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'enabled',
        type: 'bool',
      },
    ],
    name: 'EnabledDepositRoute',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'inputToken',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'outputToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'outputAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'repaymentChainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'originChainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint32',
        name: 'depositId',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'fillDeadline',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'exclusivityDeadline',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'exclusiveRelayer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'relayer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'depositor',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'updatedRecipient',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'updatedMessage',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'updatedOutputAmount',
            type: 'uint256',
          },
          {
            internalType: 'enum V3SpokePoolInterface.FillType',
            name: 'fillType',
            type: 'uint8',
          },
        ],
        indexed: false,
        internalType: 'struct V3SpokePoolInterface.V3RelayExecutionEventInfo',
        name: 'relayExecutionInfo',
        type: 'tuple',
      },
    ],
    name: 'FilledV3Relay',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'orderId',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'originChainId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'openDeadline',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderId',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'token',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'recipient',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
            ],
            internalType: 'struct Output[]',
            name: 'maxSpent',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'token',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'recipient',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
            ],
            internalType: 'struct Output[]',
            name: 'minReceived',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint64',
                name: 'destinationChainId',
                type: 'uint64',
              },
              {
                internalType: 'bytes32',
                name: 'destinationSettler',
                type: 'bytes32',
              },
              {
                internalType: 'bytes',
                name: 'originData',
                type: 'bytes',
              },
            ],
            internalType: 'struct FillInstruction[]',
            name: 'fillInstructions',
            type: 'tuple[]',
          },
        ],
        indexed: false,
        internalType: 'struct ResolvedCrossChainOrder',
        name: 'resolvedOrder',
        type: 'tuple',
      },
    ],
    name: 'Open',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'prevDestinationSettler',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'destinationSettler',
        type: 'bytes32',
      },
    ],
    name: 'SetDestinationSettler',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'inputToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'outputToken',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'outputAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'destinationChainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint32',
        name: 'depositId',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'quoteTimestamp',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'fillDeadline',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'exclusivityDeadline',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'depositor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'recipient',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'exclusiveRelayer',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
    ],
    name: 'V3FundsDeposited',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'FILLER_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_EXCLUSIVITY_PERIOD_SECONDS',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PERMIT2',
    outputs: [
      {
        internalType: 'contract IPermit2',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'chainId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'orderData',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'fillerData',
        type: 'bytes',
      },
    ],
    name: 'decode',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'inputToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'inputAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'outputToken',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'outputAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'destinationChainId',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'recipient',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'exclusiveRelayer',
            type: 'bytes32',
          },
          {
            internalType: 'uint32',
            name: 'exclusivityPeriod',
            type: 'uint32',
          },
          {
            internalType: 'bytes',
            name: 'message',
            type: 'bytes',
          },
        ],
        internalType: 'struct AcrossOrderData',
        name: '',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'exclusiveRelayer',
            type: 'bytes32',
          },
        ],
        internalType: 'struct AcrossOriginFillerData',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'depositQuoteTimeBuffer',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'destinationSettlers',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'enabledDepositRoutes',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'orderId',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'originData',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'fillerData',
        type: 'bytes',
      },
    ],
    name: 'fill',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fillDeadlineBuffer',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'fillStatuses',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentTime',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getRoleMember',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleMemberCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'numberOfDeposits',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderDataType',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'orderData',
            type: 'bytes',
          },
        ],
        internalType: 'struct OnchainCrossChainOrder',
        name: 'order',
        type: 'tuple',
      },
    ],
    name: 'open',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'originSettler',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'originChainId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'openDeadline',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderDataType',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'orderData',
            type: 'bytes',
          },
        ],
        internalType: 'struct GaslessCrossChainOrder',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'fillerData',
        type: 'bytes',
      },
    ],
    name: 'openFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderDataType',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'orderData',
            type: 'bytes',
          },
        ],
        internalType: 'struct OnchainCrossChainOrder',
        name: 'order',
        type: 'tuple',
      },
    ],
    name: 'resolve',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'originChainId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'openDeadline',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderId',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'token',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'recipient',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
            ],
            internalType: 'struct Output[]',
            name: 'maxSpent',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'token',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'recipient',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
            ],
            internalType: 'struct Output[]',
            name: 'minReceived',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint64',
                name: 'destinationChainId',
                type: 'uint64',
              },
              {
                internalType: 'bytes32',
                name: 'destinationSettler',
                type: 'bytes32',
              },
              {
                internalType: 'bytes',
                name: 'originData',
                type: 'bytes',
              },
            ],
            internalType: 'struct FillInstruction[]',
            name: 'fillInstructions',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct ResolvedCrossChainOrder',
        name: 'resolvedOrder',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'originSettler',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'originChainId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'openDeadline',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderDataType',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'orderData',
            type: 'bytes',
          },
        ],
        internalType: 'struct GaslessCrossChainOrder',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'originFillerData',
        type: 'bytes',
      },
    ],
    name: 'resolveFor',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'originChainId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'openDeadline',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'fillDeadline',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'orderId',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'token',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'recipient',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
            ],
            internalType: 'struct Output[]',
            name: 'maxSpent',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'token',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'recipient',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
            ],
            internalType: 'struct Output[]',
            name: 'minReceived',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint64',
                name: 'destinationChainId',
                type: 'uint64',
              },
              {
                internalType: 'bytes32',
                name: 'destinationSettler',
                type: 'bytes32',
              },
              {
                internalType: 'bytes',
                name: 'originData',
                type: 'bytes',
              },
            ],
            internalType: 'struct FillInstruction[]',
            name: 'fillInstructions',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct ResolvedCrossChainOrder',
        name: 'resolvedOrder',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'destChainId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'destinationSettler',
        type: 'bytes32',
      },
    ],
    name: 'setDestinationSettler',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'originToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'destinationChainId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'enabled',
        type: 'bool',
      },
    ],
    name: 'setEnableRoute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'receipt',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
