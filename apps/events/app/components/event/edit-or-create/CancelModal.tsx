import { Button, Group, Modal } from '@mantine/core'
import { IconCircleOff, IconCircleX } from '@tabler/icons-react'
import { Form } from 'react-router'

interface Props {
  opened: boolean
  onClose: () => void
  title: string
  navigationPath: string
}

export const CancelModal = ({
  opened,
  onClose,
  title,
  navigationPath,
}: Props) => {
  return (
    <Modal
      closeButtonProps={{ 'aria-label': 'Close' }}
      onClose={onClose}
      opened={opened}
      title={title}
      zIndex={2000}
    >
      <Group
        data-testid="confirmation-modal-content"
        justify="space-between"
        mt={50}
      >
        <Button
          data-testid="modal-close"
          leftSection={<IconCircleX size={18} />}
          onClick={onClose}
        >
          Sulje
        </Button>
        <Form action={navigationPath} method="GET">
          <Button
            color="red"
            data-testid="modal-cancel-event-creation"
            rightSection={<IconCircleOff size={18} />}
            type="submit"
          >
            Keskeytä
          </Button>
        </Form>
      </Group>
    </Modal>
  )
}
