import type { ID } from '@downtown65/schema'
import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Text,
  TextInput,
  Typography,
} from '@mantine/core'
import { IconCircleOff, IconCircleX } from '@tabler/icons-react'
import { type ChangeEvent, useState } from 'react'
import { Form, useNavigation } from 'react-router'

interface DeleteModalProps {
  opened: boolean
  onCloseModal: () => void
  eventTitle: string
  eventId: ID
}

export const DeleteModal = ({
  opened,
  onCloseModal,
  eventTitle,
  eventId,
}: DeleteModalProps) => {
  const [formValue, setFormValue] = useState('')
  const navigation = useNavigation()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValue(event.target.value)
  }

  return (
    <Modal
      closeButtonProps={{ 'aria-label': 'Close' }}
      onClose={onCloseModal}
      opened={opened}
      title="Tapahtuman poisto"
      zIndex={2000}
    >
      <LoadingOverlay
        visible={navigation.state === 'submitting'}
        // TODO: below
        //transitionDuration={200}
      />
      <Typography data-testid="delete-confirmation-modal-content" my="sm">
        <p>
          Varmista tapahtuman <strong>{eventTitle}</strong> poisto. Kirjoita
          allaolevaan kenttään <i>poista</i> ja klikkaa Poista.
        </p>
      </Typography>
      <Form method="delete">
        <TextInput name="eventId" type="hidden" value={eventId} />
        <TextInput
          label="Kirjoita 'poista'"
          onChange={handleChange}
          placeholder="poista"
          value={formValue}
        />
        <Text mt="sm">
          Voit peruuttaa poiston sulkemalla dialogin tai klikkaamalla Peruuta.
        </Text>
        <Group justify="space-between" mt="lg">
          <Button
            data-testid="modal-close"
            leftSection={<IconCircleX size={18} />}
            onClick={onCloseModal}
          >
            Peruuta
          </Button>
          <Button
            color="red"
            data-testid="confirm-delete"
            disabled={formValue !== 'poista'}
            rightSection={<IconCircleOff size={18} />}
            type="submit"
          >
            Poista
          </Button>
        </Group>
      </Form>
    </Modal>
  )
}
