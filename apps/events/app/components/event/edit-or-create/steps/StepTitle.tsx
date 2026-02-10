import { Center, Switch, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import type { ReducerProps } from '../reducer'
import { ActiveStep } from '../reducer'
import { NextButton, PreviousButton, StepLayout } from './LayoutSteps'

const spacing = 'md'

const validate = (inputTitle: string) => (value: string) => {
  return value.trim().length === 0 ? `${inputTitle} ei voi olla tyhjä` : null
}

export const StepTitle = ({ state, dispatch }: ReducerProps) => {
  const form = useForm({
    initialValues: {
      location: state.location,
      subtitle: state.subtitle,
      title: state.title,
    },
    // validateInputOnChange: true,
    validate: {
      location: validate('Sijainti'),
      subtitle: validate('Tarkenne'),
      title: validate('Nimi'),
    },
  })

  const matches = useMediaQuery('(max-width: 48em)', true, {
    getInitialValueInEffect: false,
  })

  const size = matches ? 'md' : 'lg'
  const switchSize = matches ? 'md' : 'lg'

  return (
    <StepLayout
      nextButton={
        <NextButton
          onClick={() => {
            if (!form.validate().hasErrors) {
              dispatch({
                kind: 'info',
                ...form.values,
                activeStep: ActiveStep.STEP_DATE,
              })
            }
          }}
        >
          Päivämäärä
        </NextButton>
      }
      prevButton={
        <PreviousButton
          onClick={() => {
            dispatch({
              kind: 'info',
              ...form.values,
              activeStep: ActiveStep.STEP_EVENT_TYPE,
            })
          }}
        >
          Laji
        </PreviousButton>
      }
      title="Perustiedot"
    >
      <TextInput
        label="Tapahtuman nimi"
        my={spacing}
        name="title"
        placeholder="Jukola Konala"
        size={size}
        withAsterisk
        {...form.getInputProps('title')}
      />
      <TextInput
        label="Tarkenne"
        my={spacing}
        name="subtitle"
        placeholder="6-7 joukkuetta"
        size={size}
        withAsterisk
        {...form.getInputProps('subtitle')}
      />
      <TextInput
        label="Missä tapahtuma järjestetään?"
        my={spacing}
        name="location"
        placeholder="Sijainti"
        size={size}
        withAsterisk
        {...form.getInputProps('location')}
      />
      <Center>
        <Switch
          checked={state.isRace}
          data-testid="race-switch"
          label="Onko kilpailu?"
          labelPosition="left"
          offLabel="EI"
          onChange={(event) => {
            dispatch({ isRace: event.currentTarget.checked, kind: 'race' })
          }}
          onLabel="ON"
          size={switchSize}
        />
      </Center>
    </StepLayout>
  )
}
