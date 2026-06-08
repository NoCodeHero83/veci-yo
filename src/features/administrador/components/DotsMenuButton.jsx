import theme from '../../../config/theme';

export default function DotsMenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: theme.colors.bgApp,
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        color: theme.colors.text,
        fontSize: '20px',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      ⋮
    </button>
  );
}
