import React, { useMemo } from 'react';
import Modal from '../react-components/modals/Modal';
import EditableTable from '../react-components/table/editable-table';
import { requestSummaryColumns } from './transfer-request.constant';
import getService from '../react-components/utils/angular-utils';

const TransferRequestSummaryModal = ({ isOpen, order, onSaveClick, onModalClose }) => {
    const { formatMessage } = useMemo(() => getService('messageService'), []);
    const quantityUnitCalculateService = useMemo(() => getService('quantityUnitCalculateService'), []);
    const localStorageService = useMemo(() => getService('localStorageService'), []);
    const QUANTITY_UNIT = useMemo(() => getService('QUANTITY_UNIT'), []);
    const showInDoses = (localStorageService.get('quantityUnit') || QUANTITY_UNIT.DOSES) === QUANTITY_UNIT.DOSES;
    const columns = useMemo(() => requestSummaryColumns(formatMessage, showInDoses,
        quantityUnitCalculateService), [showInDoses]);

    return (
        <Modal
            isOpen={isOpen}
            children={[
                <>
                    <div className="react-modal-header">
                        <span className='modal-title'>{ formatMessage('transferRequest.summary') }</span>
                    </div>
                    <div className="react-modal-body">
                        <EditableTable
                            columns={columns}
                            data={order.orderLineItems || []}
                            isReadOnly={true}
                        />
                    </div>
                    <div className="react-modal-footer">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => onModalClose()}
                        >{ formatMessage('transferRequest.cancel') }</button>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={() => onSaveClick()}
                        >{ formatMessage('transferRequest.send') }</button>
                    </div>
                </>
            ]}
        >
        </Modal>
    );
};

export default TransferRequestSummaryModal;
