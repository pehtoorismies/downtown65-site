import { Avatar, Paper, Text } from '@mantine/core'

type Properties = {
  picture: string
  nickname: string
  name: string
  email: string
}

export const ProfileBox = ({ picture, name, nickname, email }: Properties) => {
  return (
    <Paper p="sm">
      <Avatar mx="auto" radius={120} size={120} src={picture} />
      <Text
        data-testid="profile-nick"
        fw={700}
        fz={30}
        gradient={{ deg: 45, from: 'indigo', to: 'cyan' }}
        mt="md"
        style={{ fontFamily: 'Roboto, sans-serif' }}
        ta="center"
        variant="gradient"
      >
        {nickname}
      </Text>
      <Text data-testid="profile-name" fw={500} fz="md" ta="center">
        {name}
      </Text>
      <Text c="dimmed" data-testid="profile-email" fw={500} fz="sm" ta="center">
        {email}
      </Text>
    </Paper>
  )
}
