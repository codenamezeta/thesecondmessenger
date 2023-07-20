// TODO: Validation is still very basic.
//? Docs: https://react-hook-form.com/get-started
//? Docs: https://react-hook-form.com/api/useformstate/errormessage/#main

'use client'

import { SetStateAction, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import selectors from './SubscribeFormMC.module.scss'

interface Inputs {
  name: String;
  email: String;
}

const SubscribeFormMC = () => {
  const [subscriberName, setSubscriberName] = useState('Subscriber')
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [APIResponse, setAPIResponse] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();

  const updateSubscriberName = (e: { target: { value: SetStateAction<string> } }) => {
    setSubscriberName(e.target.value)
    // console.log(subscriberName)
  }
  const updateSubscriberEmail = (e: { target: { value: SetStateAction<string> } }) => {
    setSubscriberEmail(e.target.value)
    // console.log(subscriberEmail)
  }

  const subscribe: SubmitHandler<Inputs> = async (e) => {
    // e.preventDefault()
    setIsLoading(true)
    const res = await fetch('/api/mailchimp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriberName, subscriberEmail }),
    })
      .then((response) => response.text())
      .then((result) => {
        setIsLoading(false)
        setAPIResponse(result)
      })
  }

  return (
    <section id='newsletter_signup' className={selectors['newsletter-signup']}>
      {isLoading ? (
        <div className='container'>
          <h4>The Newsletter</h4>
          <br />
          <p>Loading...</p>
        </div>
      ) : (
        <form className='container' onSubmit={handleSubmit(subscribe)}>
          <h4>The Newsletter</h4>
          <input
            type='text'
            placeholder='Name'
            {...register('name', { required: false })}
            onChange={updateSubscriberName}
          />
          <input
            type='text'
            placeholder='Email'
            {...register('email', {
              required: 'An email address is required to subscribe.',
              pattern: {
                value: /^\S+@\S+$/i,
                message: "This email address doesn't seem right.",
              },
            })}
            onChange={updateSubscriberEmail}
          />
          <p style={{ color: '#f09d09' }}>
            { APIResponse }
          </p>
          <button className='btn' type='submit'>
            Subscribe
          </button>
          <p>
            Fear not, we never spam.
            <br />
            Unsubscribe anytime.
          </p>
        </form>
      )}
    </section>
  )
}

export default SubscribeFormMC
