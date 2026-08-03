'use client';
export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  return <Tag data-reveal className={className} {...rest}>{children}</Tag>;
}
