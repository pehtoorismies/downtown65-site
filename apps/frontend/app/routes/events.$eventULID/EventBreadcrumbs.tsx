import { Anchor, Breadcrumbs, Text } from '@mantine/core'
import { Link } from 'react-router'

export const EventBreadcrumbs = ({ title }: { title: string }) => {
  const breadcrumbItems = [
    { title: 'Tapahtumat', href: '/events' },
    { title: title },
  ].map((item) => {
    return item.href ? (
      <Anchor component={Link} to={item.href} key={item.title}>
        {item.title}
      </Anchor>
    ) : (
      <Text key={item.title}>{item.title}</Text>
    )
  })
  return <Breadcrumbs mb="xs">{breadcrumbItems}</Breadcrumbs>
}
