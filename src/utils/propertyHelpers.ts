// Property type mappings
export const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: 'Chung cư',
  house: 'Nhà riêng',
  villa: 'Biệt thự',
  townhouse: 'Nhà phố',
  office: 'Văn phòng',
};

export const PROPERTY_STATUS_MAP: Record<string, string> = {
  available: 'Còn trống',
  sold: 'Đã bán',
  rented: 'Đã cho thuê',
};

export const getVietnamesePropertyType = (type: string): string => {
  return PROPERTY_TYPE_MAP[type] || type;
};

export const translatePropertyType = (type: string): string => {
  return PROPERTY_TYPE_MAP[type] || type;
};

export const getVietnameseStatus = (status: string): string => {
  return PROPERTY_STATUS_MAP[status] || status;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const formatArea = (area: number): string => {
  return `${area}m²`;
};