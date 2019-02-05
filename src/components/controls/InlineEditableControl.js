/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faCheck, faPencil } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { isEmptyString, isNonEmptyString } from '../../utils/LangUtils';

const ControlWrapper = styled.div`
  display: inline-flex;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const EditableControlWrapper = styled(ControlWrapper)`
  &:hover {
    cursor: pointer;
    .control {
      border: 1px solid #cfd8dc;
    }
    .icon {
      visibility: visible;
    }
  }
`;

const Icon = styled.div`
  border-style: solid;
  border-width: 1px;
  height: 32px;
  width: 32px;
  margin-left: 10px;
  font-size: 14px;
  padding: 0;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
`;

const EditIcon = styled(Icon)`
  background-color: #ffffff;
  border-color: #cfd8dc;
  visibility: hidden;
`;

const SaveIcon = styled(Icon)`
  background-color: #7a52ea;
  border-color: #7a52ea;
  color: #ffffff;
  visibility: visible;
`;

const TextControl = styled.div`
  border: 1px solid transparent;
  position: relative;
  font-size: ${({ styleMap }) => styleMap.inputFontSize};
  line-height: ${({ styleMap }) => styleMap.lineHeight};
  margin: ${({ styleMap }) => styleMap.margin};
  padding: ${({ styleMap }) => styleMap.padding};
`;

const TextInputControl = styled.input`
  border: 1px solid #7a52ea;
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  width: 100%;
  font-size: ${({ styleMap }) => styleMap.inputFontSize};
  line-height: ${({ styleMap }) => styleMap.lineHeight};
  margin: ${({ styleMap }) => styleMap.margin};
  padding: ${({ styleMap }) => styleMap.padding};
  &:focus {
    outline: none;
  }
`;

const TextAreaControl = styled.textarea`
  border: 1px solid #7a52ea;
  margin: 0;
  min-height: 100px;
  width: 100%;
  font-size: ${({ styleMap }) => styleMap.inputFontSize};
  height: ${({ styleMap }) => (styleMap.height ? styleMap.height : 'auto')};
  line-height: ${({ styleMap }) => styleMap.lineHeight};
  margin: ${({ styleMap }) => styleMap.margin};
  padding: ${({ styleMap }) => styleMap.padding};
  &:focus {
    outline: none;
  }
`;

const TYPES = {
  TEXT: 'text',
  TEXA_AREA: 'textarea'
};

/*
 * the negative margin-left is to adjust for the padding + border offset
 */
const STYLE_MAP = {
  small: {
    fontSize: '14px',
    inputFontSize: '13px',
    lineHeight: '16px',
    margin: '0 0 0 -13px',
    padding: '6px 12px'
  },
  medium_small: {
    fontSize: '16px',
    inputFontSize: '14px',
    lineHeight: '18px',
    margin: '0 0 0 -13px',
    padding: '8px 12px'
  },
  medium: {
    fontSize: '20px',
    inputFontSize: '18px',
    lineHeight: '24px',
    margin: '0 0 0 -13px',
    padding: '8px 12px'
  },
  xlarge: {
    fontSize: '32px',
    inputFontSize: '30px',
    lineHeight: '36px',
    margin: '0 0 0 -13px',
    padding: '10px 12px'
  }
};

type Props = {
  placeholder :string;
  size :string;
  type :string;
  value :string;
  viewOnly :boolean;
  onChange :Function;
  // onChangeConfirm :Function;
  onEditToggle :Function;
  validate :Function;
}

type State = {
  currentValue :string;
  editable :boolean;
  previousValue :string;
}

/*
 * TODO: explore how to handle children. for example, there's a use case where the non-edit view could display
 *       a Badge inside TextControl
 */

export default class InlineEditableControl extends React.Component<Props, State> {

  control :any

  static defaultProps = {
    placeholder: 'Click to edit...',
    size: 'small',
    type: 'text',
    value: '',
    viewOnly: false,
    onChange: () => {},
    // onChangeConfirm: () => {},
    onEditToggle: () => {},
    validate: (value :string) :boolean => isNonEmptyString(value)
  };

  constructor(props :Object) {

    super(props);

    const initialValue :string = isNonEmptyString(props.value) ? props.value : '';
    const initializeAsEditable :boolean = isEmptyString(initialValue);

    this.control = null;

    this.state = {
      currentValue: initialValue,
      editable: initializeAsEditable,
      previousValue: initialValue
    };
  }

  componentDidUpdate(prevProps :Props, prevState :State) {

    const { onChange } = this.props;
    const { currentValue, editable } = this.state;

    // going from editable to not editable should invoke the onChange callback only if the value actually changed
    if (prevState.previousValue !== currentValue
        && prevState.editable === true
        && editable === false) {
      // if (this.props.onChangeConfirm) {
      //   this.props.onChangeConfirm(this.state.currentValue)
      //   .then((success) => {
      //     if (!success) {
      //       this.setState({
      //         currentValue: prevState.previousValue,
      //         previousValue: ''
      //       });
      //     }
      //   });
      // }
      // else {
      //   this.props.onChange(this.state.currentValue);
      // }

      // BUG: this is incorrectly triggered when switching property types. for example, we're looking at a empty
      // description field, then switch to a property type with a complete description field. in this case, this
      // component sees "currentValue" with the new property type description and compares it to the previous
      // property type description, which was "".
      onChange(currentValue);
    }
  }

  componentWillReceiveProps(nextProps :Props) {

    const { value } = this.props;

    if (value !== nextProps.value) {
      const newValue :string = isNonEmptyString(nextProps.value) ? nextProps.value : '';
      const initializeAsEditable :boolean = isEmptyString(newValue);
      this.setState({
        currentValue: newValue,
        editable: initializeAsEditable,
        previousValue: newValue
      });
    }
  }

  moveCursorToEndOfText = (event :SyntheticInputEvent<*>) => {

    /* eslint-disable no-param-reassign */
    const currentValue :string = event.target.value;
    event.target.value = '';
    event.target.value = currentValue;
    /* eslint-enable */
  }

  escape = () => {

    const { validate, viewOnly } = this.props;
    const { currentValue, previousValue } = this.state;

    // edit mode is desabled when viewOnly is true
    if (viewOnly) {
      return;
    }

    // currentValue must be valid
    if (!validate(currentValue)) {
      // TODO: update UI to indicate invalid input; onValidate callback
      return;
    }

    this.setState({
      previousValue,
      currentValue: previousValue,
      editable: false
    });
  }

  toggleEditable = () => {

    const { onEditToggle, validate, viewOnly } = this.props;
    const { currentValue, editable } = this.state;

    // edit mode is desabled when viewOnly is true
    if (viewOnly) {
      return;
    }

    // currentValue must be valid
    if (!validate(currentValue)) {
      // TODO: update UI to indicate invalid input; onValidate callback
      return;
    }

    const editableToggled = !editable;
    onEditToggle(editableToggled);

    this.setState(
      {
        editable: editableToggled,
        previousValue: currentValue
      },
      () => {
        // BUG: if there's multiple InlineEditableControl components on the page, the focus might not be on the desired
        // element. perhaps we need to take in a prop to indicate focus
        if (this.control && editable === true) {
          this.control.focus();
        }
      }
    );
  }

  handleOnBlur = () => {

    this.toggleEditable();
  }

  handleOnChange = (event :SyntheticInputEvent<*>) => {

    this.setState({
      currentValue: event.target.value
    });
  }

  handleOnKeyDown = (event :SyntheticKeyboardEvent<*>) => {

    switch (event.keyCode) {
      case 13: // 'Enter' key code
        this.toggleEditable();
        break;
      case 27: // 'Esc' key code
        this.escape();
        break;
      default:
        break;
    }
  }

  renderTextControl = () => {

    const { placeholder, size, viewOnly } = this.props;
    const { currentValue, editable } = this.state;

    if (!viewOnly && editable) {
      return (
        <TextInputControl
            styleMap={STYLE_MAP[size]}
            placeholder={placeholder}
            value={currentValue}
            onBlur={this.handleOnBlur}
            onChange={this.handleOnChange}
            onFocus={this.moveCursorToEndOfText}
            onKeyDown={this.handleOnKeyDown}
            ref={(element) => {
              this.control = element;
            }} />
      );
    }

    return (
      <TextControl
          className="control"
          styleMap={STYLE_MAP[size]}
          onClick={this.toggleEditable}
          ref={(element) => {
            this.control = element;
          }}>
        {
          isNonEmptyString(currentValue)
            ? currentValue
            : placeholder
        }
      </TextControl>
    );
  }

  renderTextAreaControl = () => {

    const { placeholder, size, viewOnly } = this.props;
    const { currentValue, editable } = this.state;

    if (!viewOnly && editable) {
      if (this.control) {
        // +2 1px border
        STYLE_MAP[size].height = `${Math.ceil(this.control.clientHeight) + 2}px`;
      }
      return (
        <TextAreaControl
            styleMap={STYLE_MAP[size]}
            placeholder={placeholder}
            value={currentValue}
            onBlur={this.handleOnBlur}
            onChange={this.handleOnChange}
            onKeyDown={this.handleOnKeyDown}
            ref={(element) => {
              this.control = element;
            }} />
      );
    }

    return (
      <TextControl
          className="control"
          styleMap={STYLE_MAP[size]}
          onClick={this.toggleEditable}
          ref={(element) => {
            this.control = element;
          }}>
        {
          isNonEmptyString(currentValue)
            ? currentValue
            : placeholder
        }
      </TextControl>
    );
  };

  getControl = () => {

    const { type } = this.props;

    switch (type) {
      case TYPES.TEXT:
        return this.renderTextControl();
      case TYPES.TEXA_AREA:
        return this.renderTextAreaControl();
      default:
        return this.renderTextControl();
    }
  }

  getEditButton = () => {

    const { viewOnly } = this.props;
    const { editable } = this.state;

    if (!viewOnly && editable) {
      return (
        <SaveIcon className="icon" onClick={this.toggleEditable}>
          <FontAwesomeIcon icon={faCheck} />
        </SaveIcon>
      );
    }

    return (
      <EditIcon className="icon" onClick={this.toggleEditable}>
        <FontAwesomeIcon icon={faPencil} />
      </EditIcon>
    );
  }

  render() {

    const { viewOnly } = this.props;

    const control = this.getControl();
    const editButton = this.getEditButton();

    if (viewOnly) {
      return (
        <ControlWrapper>
          { control }
        </ControlWrapper>
      );
    }

    return (
      <EditableControlWrapper>
        { control }
        { editButton }
      </EditableControlWrapper>
    );
  }
}
