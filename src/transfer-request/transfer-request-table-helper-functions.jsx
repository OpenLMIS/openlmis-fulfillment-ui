export const getOrderValue = (fetchedOrder, stockCardSummaryRepositoryImpl) => {
  const orderableIds = fetchedOrder.orderLineItems.map(
    (lineItem) => lineItem.orderable.id
  );

  if (orderableIds?.length) {
    return stockCardSummaryRepositoryImpl
      .query({
        programId: fetchedOrder.program.id,
        facilityId: fetchedOrder.requestingFacility.id,
        orderableId: orderableIds,
      })
      .then(function (page) {
        return getOrdersWithSoh(page, fetchedOrder);
      })
      .catch(function () {
        return fetchedOrder;
      });
  } else {
    return Promise.resolve(fetchedOrder);
  }
};

const getOrdersWithSoh = (page, fetchedOrder) => {
  const stockItems = page.content;
  const orderWithSoh = {
    ...fetchedOrder,
    orderLineItems: fetchedOrder.orderLineItems.map((lineItem) => {
      const stockItem = stockItems.find(
        (item) => item.orderable.id === lineItem.orderable.id
      );

      return {
        ...lineItem,
        soh: stockItem ? stockItem.stockOnHand : 0,
      };
    }),
  };

  return orderWithSoh;
};

export const getUpdatedOrder = (selectedOrderable, order) => {
  const newLineItem = {
    orderedQuantity: '',
    soh: selectedOrderable.soh,
    orderable: {
      id: selectedOrderable.id,
      productCode: selectedOrderable.productCode,
      fullProductName: selectedOrderable.fullProductName,
      meta: {
        versionNumber: selectedOrderable.meta.versionNumber,
      },
      netContent: selectedOrderable.netContent,
      packRoundingThreshold: selectedOrderable.packRoundingThreshold,
      roundToZero: selectedOrderable.roundToZero,
    },
  };

  const orderNewLineItems = [...order.orderLineItems, newLineItem];

  const updatedOrder = {
    ...order,
    orderLineItems: orderNewLineItems,
  };

  return updatedOrder;
};

export const isRequestValid = (order) => Boolean(
    order?.id
    && order.orderLineItems.length
    && order.orderLineItems.every(item => item.orderedQuantity !== '' && item.orderedQuantity > 0)
);

export const deleteRequest = (orderId, transferService, notificationService) => transferService
    .deleteRequest(orderId)
    .then(() => {
        notificationService.success('transferRequest.delete.success');
        return true;
    })
    .catch(() => false);

// Only a transfer request that has not been sent yet can be edited on this page.
export const isEditableRequest = (order) => order.type === 'TRANSFER_REQUEST' && order.status === 'CREATING';

export const loadRequest = (orderId, orderService, stockCardSummaryRepositoryImpl) => orderService
    .get(orderId)
    .then(order => (isEditableRequest(order)
        ? getOrderValue(order, stockCardSummaryRepositoryImpl)
        : Promise.reject({ notEditable: true })));
