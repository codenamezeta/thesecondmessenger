// pages/api/mailchimp.ts
​
import type { NextApiRequest, NextApiResponse } from 'next';
​
export default async function subscribeUser(
    req: NextApiRequest,
    res: NextApiResponse
) {
  // const { email } = JSON.parse(req.body);
  const { subscriber } = JSON.parse(req.body)
​
    if (!subscriber.subscriberEmail) {
        res.status(401).json({ error: 'Email is required' });
        return;
    }
​
    const mailchimpData = {
       members: [
          {
              email_address: subscriber.subscriberName,
              merge_fields: {
                NAME: subscriber.subscriberName,
              },
              status: 'subscribed'
          }
       ],
       update_existing: true,
    }
​
    try {
​
const audienceId = process.env.MAILCHIMP_AUDIENCE_ID as string
const URL = `https://us14.api.mailchimp.com/3.0/lists/${audienceId}`
const response = await fetch(URL,
     {
         method: 'POST',
         headers: {
             Authorization: `auth ${process.env.MAILCHIMP_API_KEY as string}`,
         },
         body: JSON.stringify(mailchimpData),
     }
 );
​
const data = await response.json()
// Error handling.
if (data.errors[0]?.error) {
     return res.status(401).json({ error: data.errors[0].error });
 } else {
     res.status(200).json({ success: true});
 }
   } catch (e) {
       res.status(401).json({error: 'Something went wrong, please try again later.'})
   }
}


// export async function subscribe(req, res) {
//   if (req.method === 'POST') {
//     const subscriber = req.body
//     console.log(
//       `Subscribe form submitted this subscriber: ${JSON.stringify(subscriber)}`
//     )
//     //* Get environment variables
//     //@ MailChimp API Key
//     const apiKey = process.env.MAILCHIMP_API_KEY
//     const server = process.env.MAILCHIMP_SERVER
//     const audienceId = process.env.MAILCHIMP_AUDIENCE_ID
//     const subscriberData = JSON.stringify({
//       members: [
//         {
//           email_address: subscriber.subscriberEmail,
//           merge_fields: {
//             NAME: subscriber.subscriberName,
//           },
//           status: 'subscribed',
//         },
//       ],
//       update_existing: true,
//     })
//     //? API Key already converted to base64 for MailChimp: https://www.youtube.com/watch?v=Rzlop3Bgk1Q
//     const headersMC = {
//       Authorization: `Basic ${apiKey}`,
//       'Content-Type': 'application/json',
//     }

//     const requestOptions = {
//       method: 'POST',
//       headers: headersMC,
//       body: subscriberData,
//     }

//     await fetch(
//       `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}`,
//       requestOptions
//     )
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data)
//         if (data.error_count) {
//           let error = data.errors[0].error
//           console.log(error)
//           res.status(500).send(error)
//         } else if (data.total_created) {
//           // console.log('Success?')
//           res
//             .status(200)
//             .send(
//               `Thank you! ${data.new_members[0].email_address} has been subscribed.`
//             )
//         } else if (data.total_updated) {
//           res
//             .status(200)
//             .send(
//               `Thank you! ${data.updated_members[0].email_address} account settings have been updated.`
//             )
//         } else
//           res.send(
//             'Not sure that worked or not. Please email admins@thesecondmessenger.com to subscribe manually.'
//           )
//       })
//       .catch((error) => console.log('Error: ', error))
//   }
// }
