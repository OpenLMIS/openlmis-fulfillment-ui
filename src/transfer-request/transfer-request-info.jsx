import React, { useMemo } from 'react';
import { formatDate } from '../react-components/utils/format-utils';
import getService from '../react-components/utils/angular-utils';

const TransferRequestInfo = ({ order }) => {
    const { formatMessage } = useMemo(() => getService('messageService'), []);

    return (
        <aside className="requisition-info">
            <ul>
                <li>
                    <strong>{ formatMessage('transferRequest.info.status') }</strong>
                    {order.status}
                </li>
                <li>
                    <strong>{ formatMessage('transferRequest.info.dateCreated') }</strong>
                    {formatDate(order.createdDate)}
                </li>
                <li>
                    <strong>{ formatMessage('transferRequest.program') }</strong>
                    {_.get(order, ['program', 'name'])}
                </li>
                <li>
                    <strong>{ formatMessage('transferRequest.reqFacility') }</strong>
                    {_.get(order, ['requestingFacility', 'name'])}
                </li>
                <li>
                    <strong>{ formatMessage('transferRequest.supFacility') }</strong>
                    {_.get(order, ['supplyingFacility', 'name'])}
                </li>
            </ul>
        </aside>
    );
};

export default TransferRequestInfo;
