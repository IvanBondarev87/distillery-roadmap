import { BoxProps } from '@material-ui/core/Box';
import { GridProps } from '@material-ui/core/Grid';
import isReactElement from 'utils/isReactElement';

type FlexBoxProps =
  Omit<BoxProps,
    'alignContent' |
    'alignItems' |
    'justifyContent'
  > &
  Pick<GridProps,
    'alignContent' |
    'alignItems' |
    'justifyContent' |
    'direction' |
    'spacing' |
    'wrap'
  >

function FlexBox(props: FlexBoxProps) {
  const {
    alignContent, alignItems, justifyContent,
    direction, spacing, wrap,

    children,

    ...boxProps
  } = props;

  const gridProps = {
    alignContent, alignItems, justifyContent,
    direction, spacing, wrap,
  }

  const griItems = React.Children.map(children, (child) => {
    if (isReactElement(child) && child.type.type === Grid) {
      return child;
    }
    return <Grid item>{child}</Grid>;
  })

  return (
    <Box {...boxProps}>
      <Grid container={true} {...gridProps}>
        {griItems}
      </Grid>
    </Box>
  );
}

export default FlexBox;