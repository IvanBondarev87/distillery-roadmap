import * as validators from './validators';

function FormExample({ onSubmit }: { onSubmit?: (values: Record<string, any>) => void }) {

  const [initialValues, setInitialValues] = useState({
    lastname: 'Cooper',
    wishlist: ['eat', 'eat'],
    gender: 'male'
  });

  const handleSubmit = async ({ values }) => {
    console.log(values);
    onSubmit?.(values);
    if (values.firstname === 'John') return {
      firstname: `Name 'John' already reserved`,
      [FORM_ERROR]: `Failed to submit form`
    };
    setInitialValues(values);
  };

  return <Box padding={1}>

    <Form onSubmit={handleSubmit} initialValues={initialValues}>

      <FlexBox spacing={1}>
        <TextField label="Firstname*" name="firstname" validate={validators.name} />
        <TextField label="Lastname*" name="lastname" validate={validators.name} />
      </FlexBox>

      <br />
      <Field name="gender" validate={validators.gender}>
        <FlexBox spacing={1} alignItems="center">
          <P>Gender*:</P>
          <Radio label="Male" value="male" />
          <Radio label="Female" value="female" />
        </FlexBox>
        <FieldError />
      </Field>

      <br />
      <Field name="badHabbits" validate={validators.badHabbits}>
        <FlexBox spacing={1} alignItems="center">
          <P>Bad habbits:</P>
          <Checkbox label="Alcohol" value="alcohol" />
          <Checkbox label="Smoking" value="smoking" />
          <Checkbox label="I like to rock'n'roll" value="i like to rock'n'roll" />
        </FlexBox>
        <FieldError />
      </Field>

      <br />
      <P>Wishlist:</P>
      <FieldArray name="wishlist" validate={validators.wishlist}>
        {({ map, push, remove }) => <>

          {map(index => (
            <FlexBox alignItems="center" spacing={1} key={index}>
              <TextField label={'Wish ' + index} name={`wishlist[${index}]`} />
              <Button size="small" onClick={() => remove(index)}>Delete</Button>
            </FlexBox>
          ))}

          <FieldError name="wishlist" />
          <br />
          <div>
            <Button size="small" onClick={() => push(null)}>Add more wish</Button>
          </div>

        </>}
      </FieldArray>

      <br />
      <Checkbox label="Are you sure" name="sure" />

      <br />
      <FormError />

      <br />
      <FlexBox spacing={1}>
        <ResetButton />
        <SubmitButton disablePristine={false} />
      </FlexBox>

    </Form>

  </Box>;
}

export default FormExample;
