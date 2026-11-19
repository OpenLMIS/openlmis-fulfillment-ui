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
import { deleteRequest, isRequestValid, loadRequest } from './transfer-request-table-helper-functions';
import { ignoreShownError } from './transfer-request-form-helper-functions';
import TransferRequestTab from './transfer-request-tab';
import { isRequestInvalid } from './transfer-request-validation-helper-functions';
import TransferRequestSummaryModal from './transfer-request-summary-modal';

const FORM_PATH = '/stockmanagement/transferRequest';

const TransferRequestTable = () => {
    const [order, setOrder] = useState();
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const { orderId } = useParams();

    const history = useHistory();

    const orderService = useMemo(() => getService('orderService'), []);
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
            loadRequest(orderId, orderService, stockCardSummaryRepositoryImpl)
                .then(setOrder)
                .catch(() => history.push(FORM_PATH));
        },
        [orderId]
    );

    const sendRequest = () => {
        if (isRequestInvalid(order, setShowValidationErrors, toast)) {
            return;
        }

        transferService.sendRequest(order)
            .then(() => {
                notificationService.success('transferRequest.submitted');
                history.push(FORM_PATH);
            })
            .catch(() => {
                setIsSummaryModalOpen(false);
            });
    };

    const saveRequest = () => {
        if (isRequestInvalid(order, setShowValidationErrors, toast)) {
            return;
        }

        setShowValidationErrors(false);
        transferService.updateRequest(order)
            .then(() => {
                toast.success(formatMessage('transferRequest.save.success'));
            })
            .catch(ignoreShownError);
    };

    const onDelete = () => {
        confirmDestroy('transferRequest.delete.prompt', 'transferRequest.delete')
            .then(() => deleteRequest(order.id, transferService, notificationService))
            .then((deleted) => {
                if (deleted) {
                    history.push(FORM_PATH);
                }
            })
            .catch(ignoreShownError);
    };

    return (
        <div className="page-container">
            {
                isSummaryModalOpen &&
                <TransferRequestSummaryModal
                    isOpen={isSummaryModalOpen}
                    order={order}
                    onSaveClick={sendRequest}
                    onModalClose={() => setIsSummaryModalOpen(false)}
                />
            }
            <div className="page-header-responsive">
                <h2>{ formatMessage('transferRequest.title') }</h2>
            </div>
            {order ? (
                <TransferRequestTab
                    passedOrder={order}
                    stockCardSummaryRepositoryImpl={stockCardSummaryRepositoryImpl}
                    showValidationErrors={showValidationErrors}
                    onOrderChange={setOrder}
                />
            ) : (
                <p>{ formatMessage('transferRequest.loading') }...</p>
            )}
            <div className="page-footer">
                <button
                    type="button"
                    className="btn danger"
                    disabled={!order}
                    onClick={onDelete}
                >{formatMessage('transferRequest.delete')}</button>
                <button
                    type="button"
                    className="btn"
                    disabled={!order}
                    onClick={saveRequest}
                >{formatMessage('transferRequest.saveDraft')}</button>
                <button
                    type="button"
                    className="btn primary"
                    disabled={!isRequestValid(order)}
                    onClick={() => setIsSummaryModalOpen(true)}
                >{formatMessage('transferRequest.send')}</button>
            </div>
        </div>
    );
};

export default TransferRequestTable;
