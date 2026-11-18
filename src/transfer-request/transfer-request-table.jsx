/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import getService from '../react-components/utils/angular-utils';
import {
    createOrderDisabled,
    getIsOrderValidArray,
    deleteRequests,
    loadRequests,
    saveDraftDisabled,
    saveRequests,
    sendRequests
} from './transfer-request-table-helper-functions';
import { ignoreShownError } from './transfer-request-form-helper-functions';
import TransferRequestTab from './transfer-request-tab';
import { isOrderInvalid } from './transfer-request-validation-helper-functions';
import TransferRequestSummaryModal from './transfer-request-summary-modal';
import TabNavigation from '../react-components/tab-navigation/tab-navigation';
import { ORDER_STATUS } from './transfer-request.constant';

const TransferRequestTable = ({ isReadOnly }) => {
    const [orders, setOrders] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [cachedOrderableOptions, setCachedOrderableOptions] = useState([]);

    const { orderIds } = useParams();

    const history = useHistory();

    const orderService = useMemo(() => getService('transferRequestService'), []);
    const transferService = useMemo(() => getService('transferService'), []);
    const notificationService = useMemo(() => getService('notificationService'), []);
    const { confirmDestroy } = useMemo(() => getService('confirmService'), []);
    const { formatMessage } = useMemo(() => getService('messageService'), []);

    const stockCardSummaryRepositoryImpl = useMemo(
        () => {
            const stockCardSummaryRepository = getService('StockCardSummaryRepositoryImpl');
            return new stockCardSummaryRepository();
        },
        []
    );

    useEffect(
        () => {
            if (orderIds) {
                const orderIdsArray = orderIds.split(',');
                setCachedOrderableOptions(orderIdsArray.map(() => []));
                loadRequests(orderIdsArray, orderService, stockCardSummaryRepositoryImpl)
                    .then(setOrders)
                    .catch(() => history.push('/stockmanagement/transferRequest'));
            }
        },
        [orderService]
    );

    const onProductAdded = (updatedOrder) => {
        setOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order => {
                if (order.id === updatedOrder.id) {
                    return updatedOrder;
                }
                return order;
            });
            return updatedOrders;
        });
    }

    const sendOrders = () => {
        if (isOrderInvalid(orders, setShowValidationErrors, toast)) {
            return;
        }

        sendRequests(orders, transferService)
            .then(() => {
                notificationService.success('transferRequest.submitted');
                history.push('/stockmanagement/transferRequest');
            })
            .catch(() => {
                setIsSummaryModalOpen(false);
            });
    };

    const updateOrders = () => {
        if (isOrderInvalid(orders, setShowValidationErrors, toast)) {
            return;
        }

        setShowValidationErrors(false);
        saveRequests(orders, transferService)
            .then(() => {
                toast.success(formatMessage('transferRequest.save.success'));
            })
            .catch(ignoreShownError);
    };

    const onOrderDelete = (index) => {
      confirmDestroy(
        'transferRequest.delete.prompt',
        'transferRequest.delete'
      ).then(() => {
        const orderToDelete = orders[index];

        deleteRequests([orderToDelete.id], orderService, notificationService)
          .then((deleted) => {
            if (!deleted) {
              return;
            }

            const updatedOrderIds = orderIds
              .split(',')
              .filter((orderId) => orderId !== orderToDelete.id)
              .join(',');

            const updatedOrders = orders.filter((_, i) => i !== index);

            history.push(`/stockmanagement/transferRequest/${updatedOrderIds}`);
            setOrders(updatedOrders);
            setCurrentTab(0);
          });
      });
    };

      const onOrderBatchDelete = () => {
        confirmDestroy(
          'transferRequest.delete.prompt.batch',
          'transferRequest.deleteBatch'
        ).then(() => {
          const orderIdsArray = orderIds.split(',');

          deleteRequests(orderIdsArray, orderService, notificationService)
            .then((deleted) => {
              if (deleted) {
                history.push('/stockmanagement/transferRequest');
              }
            });
        });
      };

    return (
        <div className="page-container">
            {
                isSummaryModalOpen &&
                <TransferRequestSummaryModal
                    isOpen={isSummaryModalOpen}
                    orders={orders}
                    onSaveClick={sendOrders}
                    onModalClose={() => setIsSummaryModalOpen(false)}
                />
            }
            <div className="page-header-responsive">
                <h2>{ formatMessage('transferRequest') }</h2>
            </div>
            {
                orders.length > 0 &&
                <div className="tabs-container">
                    <TabNavigation
                        config={
                            {
                                data: orders.map((order, index) => ({
                                    header: order.facility.name,
                                    key: order.id,
                                    isActive: currentTab === index,
                                    isCreatingStatus: order.status === ORDER_STATUS.CREATING,
                                })),
                                onTabChange: (index) => {
                                    setCurrentTab(index);
                                },
                                onOrderDelete,
                                formatMessage,
                                isTabValidArray: !isReadOnly ? getIsOrderValidArray(orders) : undefined
                            }
                        }
                    ></TabNavigation>
                </div>
            }
            <div className="currentTab">
                {(orders.length > 0) ? (
                    <TransferRequestTab
                        key={currentTab}
                        passedOrder={orders[currentTab]}
                        stockCardSummaryRepositoryImpl={stockCardSummaryRepositoryImpl}
                        showValidationErrors={showValidationErrors}
                        isTableReadOnly={isReadOnly}
                        tabIndex={currentTab}
                        cachedOrderableOptions={cachedOrderableOptions[currentTab]}
                        cacheOrderableOptions={(orderableOptions, tabIndex) => {
                            const updatedCachedOrderableOptions = cachedOrderableOptions;
                            updatedCachedOrderableOptions[tabIndex] = orderableOptions;
                            setCachedOrderableOptions(updatedCachedOrderableOptions);
                        }}
                        updateOrderArray={
                            (updatedOrder) => {
                                onProductAdded(updatedOrder);
                            }
                        } />
                ) : (
                    <p>{ formatMessage('transferRequest.loading') }...</p>
                )}
            </div>
            <div className="page-footer">
                {
                    isReadOnly ||
                    <>
                        <button
                            type="button"
                            className="btn danger"
                            disabled={!orders.length || orders.length === 0}
                            onClick={onOrderBatchDelete}
                        >{formatMessage('transferRequest.deleteBatch')}</button>
                        <button
                            type="button"
                            className="btn"
                            disabled={saveDraftDisabled(orders)}
                            onClick={() => updateOrders()}
                        >{formatMessage('transferRequest.saveDraft')}</button>
                        <button
                            type="button"
                            className="btn primary"
                            disabled={createOrderDisabled(orders)}
                            onClick={() => setIsSummaryModalOpen(true)}
                        >{formatMessage('transferRequest.send')}</button>
                    </>
                }
            </div>
        </div>
    );
};

export default TransferRequestTable;
