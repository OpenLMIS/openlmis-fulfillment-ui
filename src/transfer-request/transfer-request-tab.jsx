import React, { useCallback, useEffect, useMemo, useState } from 'react';

import QuantityUnitToggle from '../openlmis-quantity-unit-toggle/quantity-unit-toggle';
import EditableTable from '../react-components/table/editable-table';
import getService from '../react-components/utils/angular-utils';
import TransferRequestInfo from './transfer-request-info';

import { getUpdatedOrder } from './transfer-request-table-helper-functions';
import { validateOrderItem } from './transfer-request-validation-helper-functions';
import { requestTableColumns } from './transfer-request.constant';
import { SearchSelect } from './search-select';

const QUANTITY_UNIT_KEY = 'quantityUnit';

const TransferRequestTab = ({
  passedOrder,
  updateOrderArray,
  showValidationErrors,
  stockCardSummaryRepositoryImpl,
  tabIndex,
  cacheOrderableOptions,
  cachedOrderableOptions,
}) => {
  const localStorageService = useMemo(
    () => getService('localStorageService'),
    []
  );
  const { formatMessage } = useMemo(() => getService('messageService'), []);
  const loadingModalService = useMemo(
    () => getService('loadingModalService'),
    []
  );
  const QUANTITY_UNIT = useMemo(() => getService('QUANTITY_UNIT'), []);
  const featureFlagService = useMemo(
    () => getService('featureFlagService'),
    []
  );
  const DEFAULT_QUANTITY_UNIT_FEATURE_FLAG = useMemo(
    () => getService('DEFAULT_QUANTITY_UNIT_FEATURE_FLAG'),
    []
  );
  const quantityUnitCalculateService = useMemo(
    () => getService('quantityUnitCalculateService'),
    []
  );

  const [order, setOrder] = useState({ orderLineItems: [], ...passedOrder });
  const [selectedOrderable, setSelectedOrderable] = useState('');
  const [orderableOptions, setOrderableOptions] = useState(
    cachedOrderableOptions
  );

  const [currentQuantityUnit, setCurrentQuantityUnit] = useState('');
  const showInDoses = useMemo(
    () => currentQuantityUnit === QUANTITY_UNIT.DOSES,
    [currentQuantityUnit, QUANTITY_UNIT.DOSES]
  );

  useEffect(() => {
    const getDefaultUnit = () => {
      if (featureFlagService && DEFAULT_QUANTITY_UNIT_FEATURE_FLAG) {
        const flagValue = featureFlagService.get(
          DEFAULT_QUANTITY_UNIT_FEATURE_FLAG
        );
        if (
          flagValue === QUANTITY_UNIT.PACKS ||
          flagValue === QUANTITY_UNIT.DOSES
        ) {
          return flagValue;
        }
      }

      return QUANTITY_UNIT.DOSES;
    };

    const cachedUnit = localStorageService.get(QUANTITY_UNIT_KEY);
    const initialUnit = cachedUnit || getDefaultUnit();

    if (!cachedUnit) {
      localStorageService.add(QUANTITY_UNIT_KEY, initialUnit);
    }
    setCurrentQuantityUnit(initialUnit);
  }, [
    localStorageService,
    QUANTITY_UNIT,
    featureFlagService,
    DEFAULT_QUANTITY_UNIT_FEATURE_FLAG,
  ]);

  const handleQuantityUnitChange = useCallback(
    (newUnit) => {
      localStorageService.add(QUANTITY_UNIT_KEY, newUnit);
      setCurrentQuantityUnit(newUnit);

      // Recalculate all existing order items for the new unit
      const recalculatedOrderItems = order.orderLineItems.map((item) => {
        return quantityUnitCalculateService.recalculateInputQuantity(
          item,
          item.orderable.netContent,
          showInDoses,
          'orderedQuantity'
        );
      });

      const updatedOrder = { ...order, orderLineItems: recalculatedOrderItems };

      setOrder(updatedOrder);
      updateOrderArray(updatedOrder);
    },
    [
      localStorageService,
      order,
      quantityUnitCalculateService,
      showInDoses,
      updateOrderArray,
    ]
  );

  useMemo(() => {
    if (cachedOrderableOptions?.length) {
      setOrderableOptions(cachedOrderableOptions);
      return;
    }

    loadingModalService.open();
    stockCardSummaryRepositoryImpl
      .query({
        programId: order.program.id,
        facilityId: order.requestingFacility.id,
      })
      .then((page) => {
        const fetchedOrderableOptions = page.content;
        const orderableOptionsValue = fetchedOrderableOptions.map(
          (stockItem) => ({
            name: stockItem.orderable.fullProductName,
            value: { ...stockItem.orderable, soh: stockItem.stockOnHand },
          })
        );

        setOrderableOptions(orderableOptionsValue);
        loadingModalService.close();
      })
      .catch(() => {
        loadingModalService.close();
      });
  }, []);

  useEffect(() => {
    if (orderableOptions.length > 0) {
      cacheOrderableOptions(orderableOptions, tabIndex);
    }
  }, [orderableOptions]);

  const updateData = (changedItems) => {
    const updatedOrder = {
      ...order,
      orderLineItems: changedItems,
    };

    setOrder(updatedOrder);
    updateOrderArray(updatedOrder);
  };

  const addOrderable = () => {
    const updatedOrder = getUpdatedOrder(selectedOrderable, order);
    setOrder(updatedOrder);
    setSelectedOrderable('');
    updateOrderArray(updatedOrder);
  };

  const validateRow = (row) => {
    const errors = validateOrderItem(row);
    return !errors.length;
  };

  const isProductAdded =
    selectedOrderable &&
    _.find(
      order.orderLineItems,
      (item) => item.orderable.id === selectedOrderable.id
    );

  const columns = useMemo(
    () =>
      requestTableColumns(
        formatMessage,
        showInDoses,
        updateData,
        quantityUnitCalculateService
      ),
    [
      formatMessage,
      showInDoses,
      updateData,
      quantityUnitCalculateService,
    ]
  );

  return (
    <>
      <TransferRequestInfo order={order} />
      <div className='page-content'>
        <div className='transfer-request-table-container'>
          <div className='transfer-request-table'>
            <div className='transfer-request-table-header'>
              <SearchSelect
                options={orderableOptions}
                value={selectedOrderable}
                onChange={(value) => setSelectedOrderable(value)}
                objectKey={'id'}
              >
                {formatMessage('transferRequest.table.product')}
              </SearchSelect>
              <div className='buttons-container'>
                <div
                  title={isProductAdded
                    ? formatMessage('transferRequest.table.productAlreadyAdded')
                    : undefined}
                >
                  <button
                    className={'add'}
                    onClick={addOrderable}
                    disabled={!selectedOrderable || isProductAdded}
                  >
                    {formatMessage('transferRequest.table.addProduct')}
                  </button>
                </div>
                <QuantityUnitToggle
                  selectedUnit={currentQuantityUnit}
                  onUnitChange={handleQuantityUnitChange}
                />
              </div>
            </div>

            <EditableTable
              columns={columns}
              data={order.orderLineItems || []}
              updateData={updateData}
              validateRow={validateRow}
              showValidationErrors={showValidationErrors}
              pageSize={6}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferRequestTab;
