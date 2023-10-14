import React from 'react'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_TWITTER } from 'utils/config'
import { DefaultSeo } from 'next-seo'

export function Seo() {
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : SITE_URL

  return (
    <DefaultSeo
      title={SITE_NAME}
      defaultTitle={SITE_NAME}
      titleTemplate={`%s`}
      description={SITE_DESCRIPTION}
      defaultOpenGraphImageWidth={572}
      defaultOpenGraphImageHeight={716}
      openGraph={{
        type: 'website',
        siteName: SITE_NAME,
        url: origin,
        images: [
          {
            url: `https://bafybeiaanz35rifxfwu43cc3mdzbuevas3mflm77htcrmprwy3fdwhmgji.ipfs.w3s.link/parachute.jpg`,
            alt: `${SITE_NAME} Open Graph Image`,
          },
        ],
      }}
      twitter={{
        handle: `@${SOCIAL_TWITTER}`,
        site: `@${SOCIAL_TWITTER}`,
        cardType: 'summary_large_image',
      }}
    />
  )
}
