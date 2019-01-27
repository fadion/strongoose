export const isSupportedType = (type: any) => {
  return [
    'String',
    'Number',
    'Date',
    'Buffer',
    'Boolean',
    'ObjectId',
    'Decimal128',
    'Map'
  ].includes(type)
}