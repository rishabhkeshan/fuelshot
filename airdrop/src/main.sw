contract;

use {
    std::{
        asset::{
            mint_to,
            transfer,
        },
        auth::msg_sender,
        block::timestamp,
        call_frames::{
            msg_asset_id,
        },
        constants::DEFAULT_SUB_ID,
        context::msg_amount,
        hash::Hash,
        logging::log,
    },
};

abi MyTokenDistributor {
    #[storage(read, write), payable]
    fn distribute_tokens(recipients: Vec<Identity>, amounts: Vec<u64>);
}

impl MyTokenDistributor for Contract {
    #[storage(read, write), payable]
    fn distribute_tokens(recipients: Vec<Identity>, amounts: Vec<u64>) {
        assert(recipients.len() == amounts.len());
        let mut counter = 0;
        while counter < recipients.len() {
            let recipient = recipients.get(counter).unwrap();
            let asset_id = msg_asset_id();
            let amount = amounts.get(counter).unwrap();
            transfer(recipient, asset_id, amount);
            counter += 1;
        }
    }
}
// contract;

// use {
//     std::{
//         asset::{
//             mint_to,
//             transfer,
//         },
//         auth::msg_sender,
//         block::timestamp,
//         call_frames::{
//             msg_asset_id,
//         },
//         constants::DEFAULT_SUB_ID,
//         context::msg_amount,
//         hash::Hash,
//         logging::log,
//     },
// };

// abi MyTokenDistributor {
//     #[storage(read, write), payable]
//     fn distribute_tokens(recipients: [Identity; N], amounts: [u64; N]);
// }

// impl MyTokenDistributor for Contract {
//     #[storage(read, write), payable]
//     fn distribute_tokens(recipients: [Identity; N], amounts: [u64; N]) {
//         // Iterate over the recipients and amounts
//         for i in 0..N {
//             let recipient = recipients[i];
//             let asset_id = msg_asset_id();
//             let amount = amounts[i];

//             // Perform the transfer
//             transfer(recipient, asset_id, amount);
//         }
//     }
// }
