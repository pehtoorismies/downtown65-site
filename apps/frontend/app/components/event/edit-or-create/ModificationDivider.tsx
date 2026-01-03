import { Box, Divider } from '@mantine/core'
import { IconAlertTriangleFilled } from '@tabler/icons-react'

export const ModificationDivider = () => {
  return (
    <Divider
      mt="xl"
      size="sm"
      variant="dashed"
      labelPosition="center"
      label={
        <>
          <IconAlertTriangleFilled size={12} />
          <Box ml={5}>Modification zone</Box>
        </>
      }
    />
  )
}
