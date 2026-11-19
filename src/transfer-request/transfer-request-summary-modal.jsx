import React, { useMemo, useState } from 'react';
import Modal from '../react-components/modals/Modal';
import EditableTable from '../react-components/table/editable-table';
import { requestSummaryColumns } from './transfer-request.constant';
import TabNavigation from '../react-components/tab-navigation/tab-navigation';
import getService from '../react-components/utils/angular-utils';

const TransferRequestSummaryModal = ({ isOpen, orders, onSaveClick, onModalClose }) => {
    const { formatMessage } = useMemo(() => getService('messageService'), []);
    const quantityUnitCalculateService = useMemo(() => getService('quantityUnitCalculateService'), []);
    const localStorageService = useMemo(() => getService('localStorageService'), []);
    const QUANTITY_UNIT = useMemo(() => getService('QUANTITY_UNIT'), []);
    const showInDoses = (localStorageService.get('quantityUnit') || QUANTITY_UNIT.DOSES) === QUANTITY_UNIT.DOSES;
    const columns = useMemo(() => requestSummaryColumns(formatMessage, showInDoses,
        quantityUnitCalculateService), [showInDoses]);
    const [currentTab, setCurrentTab] = useState(0);

    return (
        <Modal
            isOpen={isOpen}
            children={[
                <>
                    <div className="react-modal-header">
                        <span className='modal-title'>{ formatMessage('transferRequest.summary') }</span>
                    </div>
                    <div className="react-modal-body">
                        <TabNavigation
                            config={
                                {
                                    data: orders.map((order, index) => ({
                                        header: order.facility.name,
                                        key: order.id,
                                        isActive: currentTab === index
                                    })),
                                    onTabChange: (index) => {
                                        setCurrentTab(index);
                                    }
                                }
                            }
                        ></TabNavigation>
                        <div>
                            <div>
                                {
                                    currentTab !== undefined &&
                                    <EditableTable
                                        columns={columns}
                                        data={orders[currentTab].orderLineItems || []}
                                        isReadOnly={true}
                                    />
                                }
                            </div>
                        </div>
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
