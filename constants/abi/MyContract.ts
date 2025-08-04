export const MY_CONTRACT_ABI = [
    {
      "type": "function",
      "name": "pause",
      "inputs": [],
      "outputs": [],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "unpause",
      "inputs": [],
      "outputs": [],
      "state_mutability": "external"
    },
    {
      "type": "impl",
      "name": "UpgradeableImpl",
      "interface_name": "openzeppelin_upgrades::interface::IUpgradeable"
    },
    {
      "type": "interface",
      "name": "openzeppelin_upgrades::interface::IUpgradeable",
      "items": [
        {
          "type": "function",
          "name": "upgrade",
          "inputs": [
            {
              "name": "new_class_hash",
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "StarkTipsImpl",
      "interface_name": "stark_tips_contract::interface::Istarktips::Istarktips"
    },
    {
      "type": "struct",
      "name": "core::byte_array::ByteArray",
      "members": [
        {
          "name": "data",
          "type": "core::array::Array::<core::bytes_31::bytes31>"
        },
        {
          "name": "pending_word",
          "type": "core::felt252"
        },
        {
          "name": "pending_word_len",
          "type": "core::integer::u32"
        }
      ]
    },
    {
      "type": "struct",
      "name": "core::integer::u256",
      "members": [
        {
          "name": "low",
          "type": "core::integer::u128"
        },
        {
          "name": "high",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "struct",
      "name": "stark_tips_contract::structs::structs::TipPage",
      "members": [
        {
          "name": "id",
          "type": "core::integer::u256"
        },
        {
          "name": "creator",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "name",
          "type": "core::byte_array::ByteArray"
        },
        {
          "name": "description",
          "type": "core::byte_array::ByteArray"
        },
        {
          "name": "created_at",
          "type": "core::integer::u64"
        },
        {
          "name": "total_tips_recieved",
          "type": "core::integer::u256"
        },
        {
          "name": "total_amount_recieved",
          "type": "core::integer::u256"
        },
        {
          "name": "is_active",
          "type": "core::bool"
        }
      ]
    },
    {
      "type": "struct",
      "name": "stark_tips_contract::structs::structs::Tip",
      "members": [
        {
          "name": "id",
          "type": "core::integer::u256"
        },
        {
          "name": "page_id",
          "type": "core::integer::u256"
        },
        {
          "name": "sender",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "creator",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "amount",
          "type": "core::integer::u256"
        },
        {
          "name": "message",
          "type": "core::byte_array::ByteArray"
        },
        {
          "name": "timestamp",
          "type": "core::integer::u64"
        }
      ]
    },
    {
      "type": "interface",
      "name": "stark_tips_contract::interface::Istarktips::Istarktips",
      "items": [
        {
          "type": "function",
          "name": "create_tip_page",
          "inputs": [
            {
              "name": "creator_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "page_name",
              "type": "core::byte_array::ByteArray"
            },
            {
              "name": "description",
              "type": "core::byte_array::ByteArray"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "send_tip",
          "inputs": [
            {
              "name": "page_id",
              "type": "core::integer::u256"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            },
            {
              "name": "message",
              "type": "core::byte_array::ByteArray"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_page_info",
          "inputs": [
            {
              "name": "page_id",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "stark_tips_contract::structs::structs::TipPage"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_tips_for_page",
          "inputs": [
            {
              "name": "page_id",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<stark_tips_contract::structs::structs::Tip>"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_creator_pages",
          "inputs": [
            {
              "name": "creator",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<core::integer::u256>"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "deactivate_page",
          "inputs": [
            {
              "name": "page_id",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "activate_page",
          "inputs": [
            {
              "name": "page_id",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_total_pages",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_recent_tips",
          "inputs": [
            {
              "name": "limit",
              "type": "core::integer::u32"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<stark_tips_contract::structs::structs::Tip>"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "impl",
      "name": "PausableImpl",
      "interface_name": "openzeppelin_security::interface::IPausable"
    },
    {
      "type": "interface",
      "name": "openzeppelin_security::interface::IPausable",
      "items": [
        {
          "type": "function",
          "name": "is_paused",
          "inputs": [],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "impl",
      "name": "AccessControlMixinImpl",
      "interface_name": "openzeppelin_access::accesscontrol::interface::AccessControlABI"
    },
    {
      "type": "interface",
      "name": "openzeppelin_access::accesscontrol::interface::AccessControlABI",
      "items": [
        {
          "type": "function",
          "name": "has_role",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_role_admin",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            }
          ],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "grant_role",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "revoke_role",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "renounce_role",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "hasRole",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "getRoleAdmin",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            }
          ],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "grantRole",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "revokeRole",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "renounceRole",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "supports_interface",
          "inputs": [
            {
              "name": "interface_id",
              "type": "core::felt252"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "default_admin",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "token_address",
          "type": "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_security::pausable::PausableComponent::Paused",
      "kind": "struct",
      "members": [
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_security::pausable::PausableComponent::Unpaused",
      "kind": "struct",
      "members": [
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_security::pausable::PausableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "Paused",
          "type": "openzeppelin_security::pausable::PausableComponent::Paused",
          "kind": "nested"
        },
        {
          "name": "Unpaused",
          "type": "openzeppelin_security::pausable::PausableComponent::Unpaused",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
      "kind": "struct",
      "members": [
        {
          "name": "role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "sender",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
      "kind": "struct",
      "members": [
        {
          "name": "role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "sender",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
      "kind": "struct",
      "members": [
        {
          "name": "role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "previous_admin_role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "new_admin_role",
          "type": "core::felt252",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "RoleGranted",
          "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
          "kind": "nested"
        },
        {
          "name": "RoleRevoked",
          "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
          "kind": "nested"
        },
        {
          "name": "RoleAdminChanged",
          "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_introspection::src5::SRC5Component::Event",
      "kind": "enum",
      "variants": []
    },
    {
      "type": "event",
      "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
      "kind": "struct",
      "members": [
        {
          "name": "class_hash",
          "type": "core::starknet::class_hash::ClassHash",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "Upgraded",
          "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::events::events::TipPageCreated",
      "kind": "struct",
      "members": [
        {
          "name": "page_id",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "creator",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "page_name",
          "type": "core::byte_array::ByteArray",
          "kind": "data"
        },
        {
          "name": "description",
          "type": "core::byte_array::ByteArray",
          "kind": "data"
        },
        {
          "name": "created_at",
          "type": "core::integer::u64",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::events::events::TipSent",
      "kind": "struct",
      "members": [
        {
          "name": "page_id",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "sender",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "creator",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "amount",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "message",
          "type": "core::byte_array::ByteArray",
          "kind": "data"
        },
        {
          "name": "timestamp",
          "type": "core::integer::u64",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::events::events::TokenAdded",
      "kind": "struct",
      "members": [
        {
          "name": "token_address",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "symbol",
          "type": "core::byte_array::ByteArray",
          "kind": "data"
        },
        {
          "name": "decimals",
          "type": "core::integer::u8",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::events::events::TokenRemoved",
      "kind": "struct",
      "members": [
        {
          "name": "token_address",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::events::events::TipPageDeactivated",
      "kind": "struct",
      "members": [
        {
          "name": "page_id",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "page_name",
          "type": "core::byte_array::ByteArray",
          "kind": "data"
        },
        {
          "name": "creator",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "deactivated_at",
          "type": "core::integer::u64",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::events::events::TipPageActivated",
      "kind": "struct",
      "members": [
        {
          "name": "page_id",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "page_name",
          "type": "core::byte_array::ByteArray",
          "kind": "data"
        },
        {
          "name": "creator",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "activated_at",
          "type": "core::integer::u64",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "stark_tips_contract::contract::starktips::StarkTips::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "PausableEvent",
          "type": "openzeppelin_security::pausable::PausableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "AccessControlEvent",
          "type": "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
          "kind": "flat"
        },
        {
          "name": "SRC5Event",
          "type": "openzeppelin_introspection::src5::SRC5Component::Event",
          "kind": "flat"
        },
        {
          "name": "UpgradeableEvent",
          "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "TipPageCreated",
          "type": "stark_tips_contract::events::events::TipPageCreated",
          "kind": "nested"
        },
        {
          "name": "TipSent",
          "type": "stark_tips_contract::events::events::TipSent",
          "kind": "nested"
        },
        {
          "name": "TokenAdded",
          "type": "stark_tips_contract::events::events::TokenAdded",
          "kind": "nested"
        },
        {
          "name": "TokenRemoved",
          "type": "stark_tips_contract::events::events::TokenRemoved",
          "kind": "nested"
        },
        {
          "name": "TipPageDeactivated",
          "type": "stark_tips_contract::events::events::TipPageDeactivated",
          "kind": "nested"
        },
        {
          "name": "TipPageActivated",
          "type": "stark_tips_contract::events::events::TipPageActivated",
          "kind": "nested"
        }
      ]
    }
  ] as const;