/*
 * @flow
 */

import React from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

import { isNonEmptyString } from '../../utils/LangUtils';

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
  font-size: ${(props) => {
    return props.styleMap.fontSize;
  }};
  line-height: ${(props) => {
    return props.styleMap.lineHeight;
  }};
  margin: ${(props) => {
    return props.styleMap.margin;
  }};
  padding: ${(props) => {
    return props.styleMap.padding;
  }};
`;

const TextInputControl = styled.input`
  border: 1px solid #7a52ea;
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  width: 100%;
  font-size: ${(props) => {
    return props.styleMap.inputFontSize;
  }};
  line-height: ${(props) => {
    return props.styleMap.lineHeight;
  }};
  margin: ${(props) => {
    return props.styleMap.margin;
  }};
  padding: ${(props) => {
    return props.styleMap.padding;
  }};
  &:focus {
    outline: none;
  }
`;

const TextAreaControl = styled.textarea`
  border: 1px solid #7a52ea;
  margin: 0;
  min-height: 100px;
  width: 100%;
  font-size: ${(props) => {
    return props.styleMap.inputFontSize;
  }};
  height: ${(props) => {
    return props.styleMap.height ? props.styleMap.height : 'auto';
  }};
  line-height: ${(props) => {
    return props.styleMap.lineHeight;
  }};
  margin: ${(props) => {
    return props.styleMap.margin;
  }};
  padding: ${(props) => {
    return props.styleMap.padding;
  }};
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
  placeholder :string,
  size :string,
  type :string,
  value :string,
  viewOnly :boolean,
  onChange :Function,
  // onChangeConfirm :Function,
  onEditToggle :Function
}

type State = {
  currentValue :string,
  editable :boolean,
  previousValue :string
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
    onEditToggle: () => {}
  };

  constructor(props :Object) {

    super(props);

    const initialValue :string = isNonEmptyString(this.props.value) ? this.props.value : '';
    const initializeAsEditable :boolean = !isNonEmptyString(initialValue);

    this.control = null;

    this.state = {
      currentValue: initialValue,
      editable: initializeAsEditable,
      previousValue: initialValue
    };
  }

  componentDidUpdate(prevProps :Object, prevState :Object) {

    if (this.control
        && prevState.editable === false
        && this.state.editable === true) {
      // BUG: if there's multiple InlineEditableControl components on the page, the focus might not be on the desired
      // element. perhaps need to take in a prop to indicate focus
      this.control.focus();
    }

    // going from editable to not editable should invoke the onChange callback only if the value actually changed
    if (prevState.previousValue !== this.state.currentValue
        && prevState.editable === true
        && this.state.editable === false) {
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
      this.props.onChange(this.state.currentValue);
    }
  }

  componentWillReceiveProps(nextProps :Object) {

    if (this.props.value !== nextProps.value) {
      const newValue :string = isNonEmptyString(nextProps.value) ? nextProps.value : '';
      const initializeAsEditable :boolean = !isNonEmptyString(newValue);
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

  toggleEditable = () => {

    if (this.props.viewOnly) {
      return;
    }

    if (!isNonEmptyString(this.state.currentValue)) {
      return;
    }

    const editable = !this.state.editable;
    this.props.onEditToggle(editable);

    this.setState({
      editable,
      previousValue: this.state.currentValue
    });
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
      case 27: // 'Esc' key code
        this.toggleEditable();
        break;
      default:
        break;
    }
  }

  renderTextControl = () => {

    if (!this.props.viewOnly && this.state.editable) {
      return (
        <TextInputControl
            styleMap={STYLE_MAP[this.props.size]}
            placeholder={this.props.placeholder}
            value={this.state.currentValue}
            onBlur={this.handleOnBlur}
            onChange={this.handleOnChange}
            onFocus={this.moveCursorToEndOfText}
            onKeyDown={this.handleOnKeyDown}
            innerRef={(element) => {
              this.control = element;
            }} />
      );
    }

    return (
      <TextControl
          className="control"
          styleMap={STYLE_MAP[this.props.size]}
          onClick={this.toggleEditable}
          innerRef={(element) => {
            this.control = element;
          }}>
        {
          isNonEmptyString(this.state.currentValue)
            ? this.state.currentValue
            : this.props.placeholder
        }
      </TextControl>
    );
  }

  renderTextAreaControl = () => {

    if (!this.props.viewOnly && this.state.editable) {
      if (this.control) {
        // +2 1px border
        STYLE_MAP[this.props.size].height = `${Math.ceil(this.control.clientHeight) + 2}px`;
      }
      return (
        <TextAreaControl
            styleMap={STYLE_MAP[this.props.size]}
            placeholder={this.props.placeholder}
            value={this.state.currentValue}
            onBlur={this.handleOnBlur}
            onChange={this.handleOnChange}
            onKeyDown={this.handleOnKeyDown}
            innerRef={(element) => {
              this.control = element;
            }} />
      );
    }

    return (
      <TextControl
          className="control"
          styleMap={STYLE_MAP[this.props.size]}
          onClick={this.toggleEditable}
          innerRef={(element) => {
            this.control = element;
          }}>
        {
          isNonEmptyString(this.state.currentValue)
            ? this.state.currentValue
            : this.props.placeholder
        }
      </TextControl>
    );
  };

  getControl = () => {

    switch (this.props.type) {
      case TYPES.TEXT:
        return this.renderTextControl();
      case TYPES.TEXA_AREA:
        return this.renderTextAreaControl();
      default:
        return this.renderTextControl();
    }
  }

  getEditButton = () => {

    if (!this.props.viewOnly && this.state.editable) {
      return (
        <SaveIcon className="icon" onClick={this.toggleEditable}>
          <FontAwesomeIcon pack="fas" name="check" />
        </SaveIcon>
      );
    }

    return (
      <EditIcon className="icon" onClick={this.toggleEditable}>
        <FontAwesomeIcon pack="fas" name="pencil-alt" />
      </EditIcon>
    );
  }

  render() {

    const control = this.getControl();
    const editButton = this.getEditButton();

    if (this.props.viewOnly) {
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
