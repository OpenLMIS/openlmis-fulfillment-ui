import React from 'react';
import QuantityUnitInput from '../openlmis-quantity-unit-input/openlmis-quantity-unit-input';
import TrashButton from '../react-components/buttons/trash-button';

const packSizeColumn = (formatMessage) => ({
  Header: formatMessage('transferRequest.table.packSize'),
  accessor: 'orderable.netContent',
});

export const requestTableColumns = (
  formatMessage,
  showInDoses,
  updateData,
  quantityUnitCalculateService
) => {
  return [
    {
      Header: formatMessage('transferRequest.table.productCode'),
      accessor: 'orderable.productCode',
    },
    {
      Header: formatMessage('transferRequest.table.product'),
      accessor: 'orderable.fullProductName',
    },
    packSizeColumn(formatMessage),
    {
      Header: formatMessage('transferRequest.table.soh'),
      accessor: 'soh',
      Cell: (props) => {
        const sohQuantity = props.value;
        const netContent = props.row.original.orderable.netContent;

        const parsedStockOnHand =
          quantityUnitCalculateService.recalculateSOHQuantity(
            sohQuantity,
            netContent,
            showInDoses
          );

        return <div className='text-right'>{parsedStockOnHand}</div>;
      },
    },
    {
      Header: formatMessage('transferRequest.table.quantity'),
      accessor: 'orderedQuantity',
      Cell: (props) => {
        const { row } = props;
        const rowData = row.original;

        const handleQuantityChange = (recalculatedItem) => {
          const allOrderItems = props.data;

          const updatedData = [...allOrderItems].map((item) =>
            item.orderable.id === recalculatedItem.orderable.id
              ? recalculatedItem
              : item
          );

          updateData(updatedData);
        };

        return (
          <QuantityUnitInput
            {...props}
            showInDoses={showInDoses}
            item={rowData}
            onChangeQuantity={handleQuantityChange}
            showPacksToOrderHint
            numeric
            key={`quantity-input-${rowData.orderable?.id}`}
          />
        );
      },
    },
    {
      Header: formatMessage('transferRequest.table.actions'),
      accessor: 'id',
      Cell: ({ row: { index }, deleteRow }) => (
        <TrashButton onClick={() => deleteRow(index)} />
      ),
    },
  ];
};

export const requestSummaryColumns = (
  formatMessage,
  showInDoses,
  quantityUnitCalculateService
) => [
  {
    Header: formatMessage('transferRequest.table.productCode'),
    accessor: 'orderable.productCode',
  },
  {
    Header: formatMessage('transferRequest.table.product'),
    accessor: 'orderable.fullProductName',
  },
  packSizeColumn(formatMessage),
  {
    Header: formatMessage('transferRequest.table.soh'),
    accessor: 'soh',
    Cell: (props) => {
      const sohQuantity = props.value;
      const netContent = props.row.original.orderable.netContent;

      const parsedStockOnHand =
        quantityUnitCalculateService.recalculateSOHQuantity(
          sohQuantity,
          netContent,
          showInDoses
        );

      return <div className='text-right'>{parsedStockOnHand}</div>;
    },
  },
  {
    Header: formatMessage('transferRequest.table.quantity'),
    accessor: 'orderedQuantity',
    Cell: (props) => {
      const { row } = props;
      const rowData = row.original;

      return (
        <QuantityUnitInput
          {...props}
          showInDoses={showInDoses}
          item={rowData}
          onChangeQuantity={() => {}}
          disabled={true}
          showPacksToOrderHint
          numeric
          key={`readonly-quantity-input-${rowData.orderable?.id}`}
        />
      );
    },
  },
];
