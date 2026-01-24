import { redirect } from 'next/navigation'

export default function BlogPostRedirectPage({
  params,
}: {
  params: { slug: string }
}) {
  redirect(`/resources/${params.slug}`)
}





