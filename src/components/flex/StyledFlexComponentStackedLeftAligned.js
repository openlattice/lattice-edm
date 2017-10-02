/*
 * @flow
 */

import styled from 'styled-components';

import StyledFlexComponentStacked from './StyledFlexComponentStacked';

const StyledFlexComponentStackedLeftAligned = StyledFlexComponentStacked.extend`
  align-items: flex-start;
`;

export default StyledFlexComponentStackedLeftAligned;
