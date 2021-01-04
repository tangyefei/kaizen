import React from 'react';

class Tag extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { text, defaultText, isActive, handleClick } = this.props;

    return <span data-text={text} className={isActive ? 'tag active' : 'tag' } onClick={() => handleClick(text)}>{text || defaultText}</span>
  }
}

export default Tag;