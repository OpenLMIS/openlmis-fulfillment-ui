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

import React, { useMemo } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import TransferRequestTable from './transfer-request-table';
import TransferRequestForm from './transfer-request-form';
import Breadcrumbs from '../react-components/breadcrumbs/breadcrumbs';
import getService from '../react-components/utils/angular-utils';

const TransferRequestRouting = () => {
    const { formatMessage } = useMemo(() => getService('messageService'), []);

    return (
        <div className="page-responsive">
            <Breadcrumbs
                routes={[
                    { path: "/stockmanagement/transferRequest", breadcrumb: formatMessage('transferRequest.title') },
                    { path: "/stockmanagement/transferRequest/:orderId",
                        breadcrumb: formatMessage('transferRequest.edit') }
                ]}
            />
            <Switch>
                <Route path="/stockmanagement/transferRequest/:orderId">
                    <TransferRequestTable />
                </Route>
                <Route path="/stockmanagement/transferRequest/">
                    <TransferRequestForm />
                </Route>
            </Switch>
        </div>
    );
};

const TransferRequestPage = () => {
    return (
        <Router basename="/" hashType="hashbang">
            <TransferRequestRouting />
        </Router>
    );
};

export default TransferRequestPage;
