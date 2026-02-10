import { Anchor, Breadcrumbs, Text } from '@mantine/core'
import { Link } from 'react-router'

export const EventBreadcrumbs = ({ title }: { title: string }) => {
  const breadcrumbItems = [
    { href: '/events', title: 'Tapahtumat' },
    { title: title },
  ].map((item) => {
    return item.href ? (
      <Anchor component={Link} key={item.title} to={item.href}>
        {item.title}
      </Anchor>
    ) : (
      <Text key={item.title}>{item.title}</Text>
    )
  })
  return <Breadcrumbs mb="xs">{breadcrumbItems}</Breadcrumbs>
}
