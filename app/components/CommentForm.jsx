import { useState } from 'react'
import { useForm } from 'react-hook-form'
import selectors from '../styles/CommentForm.module.scss'

export default function CommentForm({ _id }) {
  const [formData, setFormData] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    let response
    setFormData(data)
    try {
      response = await fetch('/api/createComment', {
        method: 'POST',
        body: JSON.stringify(data),
        type: 'application/json',
      })
      setIsSubmitting(false)
      setHasSubmitted(true)
    } catch (err) {
      setFormData(err)
    }
  }

  if (isSubmitting) {
    return <h3>Submitting comment…</h3>
  }
  if (hasSubmitted) {
    return (
      <>
        <h3>Your comment has been submitted</h3>
        <span style={{ fontSize: '0.8em' }}>
          A human needs to first read every new comment and approve them because
          the internet is scary sometimes.
          <br />
          Once your comment is approved it will appear here.
        </span>
        <ul style={{ listStyle: 'none' }}>
          <li>
            Name: {formData.name} <br />
            Email: {formData.email} <br />
            Comment: {formData.comment}
          </li>
        </ul>
      </>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={selectors['comment-form']}
      disabled
    >
      <input {...register('_id')} type='hidden' name='_id' value={_id} />
      <label htmlFor='name'>
        <span>Name</span>
      </label>
      <input
        name='name'
        {...register('name', { required: true })}
        placeholder='John Appleseed'
      />

      <label htmlFor='email'>
        <span>Email</span>
      </label>
      <input
        name='email'
        type='email'
        {...register('email', { required: true })}
        placeholder='your@email.com'
      />
      <label htmlFor='comment'>
        <span>Comment</span>
      </label>
      <textarea
        {...register('comment', { required: true })}
        name='comment'
        rows='8'
        placeholder='Enter your comment here. Make it count.'
      ></textarea>
      {/* errors will return when field validation fails  */}
      {errors.exampleRequired && <span>This field is required</span>}
      <input type='submit' />
    </form>
  )
}
