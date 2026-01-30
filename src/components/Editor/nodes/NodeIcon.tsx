import { 
  FaFacebookF, 
  FaInstagram, 
  FaTiktok, 
  FaYoutube, 
  FaLinkedinIn, 
  FaGoogle, 
  FaSearch, 
  FaUsers,
  FaFileAlt,
  FaShoppingCart,
  FaVideo,
  FaCreditCard,
  FaCheck,
  FaPenFancy,
  FaCalendarAlt,
  FaClipboardList,
  FaEnvelope,
  FaLayerGroup,
  FaSms,
  FaWhatsapp,
  FaUserPlus,
  FaDollarSign,
  FaArrowUp,
  FaTimes,
  FaFilter,
} from 'react-icons/fa';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
  FaGoogle,
  FaSearch,
  FaUsers,
  FaFileAlt,
  FaShoppingCart,
  FaVideo,
  FaCreditCard,
  FaCheck,
  FaPenFancy,
  FaCalendarAlt,
  FaClipboardList,
  FaEnvelope,
  FaLayerGroup,
  FaSms,
  FaWhatsapp,
  FaUserPlus,
  FaDollarSign,
  FaArrowUp,
  FaTimes,
  FaFilter,
};

interface NodeIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export const NodeIcon = ({ iconName, className = '', style }: NodeIconProps) => {
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    return null;
  }
  
  return <IconComponent className={className} style={style} />;
};
