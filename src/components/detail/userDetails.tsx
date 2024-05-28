import type { FC } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import { PropertyList } from '../property-list';
import { PropertyListItem } from '../property-list-item';

interface UserBasicDetailsProps {
  email: string;
  name: string;
}

export const UserBasicDetails: FC<UserBasicDetailsProps> = (props) => {
  const { email,name, ...other } = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';


  return (
    <Card {...other}>
      <CardHeader title="Basic Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Email"
          value={email}
        />
        <PropertyListItem
          align={align}
          divider
          label="Name"
          value={name}
        />
        {/* <PropertyListItem
          align={align}
          divider
          label="Phone"
          value={phone}
        />
        <PropertyListItem
          align={align}
          divider
          label="Country"
          value={country}
        />
        <PropertyListItem
          align={align}
          divider
          label="State/Region"
          value={state}
        />
        <PropertyListItem
          align={align}
          divider
          label="Address 1"
          value={state}
        />
        <PropertyListItem
          align={align}
          divider
          label="Address 2"
          value={address2}
        /> */}
      </PropertyList>
      <CardActions
        sx={{
          flexWrap: 'wrap',
          px: 3,
          py: 2,
          m: -1
        }}
      >
        {/* <Button
          sx={{ m: 1 }}
          variant="outlined"
        >
          Reset &amp; Send Password
        </Button>
        <Button sx={{ m: 1 }}>
          Login as Customer
        </Button> */}
      </CardActions>
    </Card>
  );
};

UserBasicDetails.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};
