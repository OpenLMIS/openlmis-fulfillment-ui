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
import { useHistory } from 'react-router-dom';
import getService from '../react-components/utils/angular-utils';
import { SearchSelect } from './search-select';
import {
    buildTransferRequest,
    goToRequestEdit,
    loadCurrentSupplierOptions
} from './transfer-request-form-helper-functions';

const toOptions = (items) => _.map(items, item => ({ name: item.name, value: item.id }));

const TransferRequestForm = () => {

    const history = useHistory();

    const [programOptions, setProgramOptions] = useState([]);
    const [requestingFacilityOptions, setRequestingFacilityOptions] = useState([]);
    const [supplyingFacilityOptions, setSupplyingFacilityOptions] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedRequestingFacility, setSelectedRequestingFacility] = useState('');
    const [selectedSupplyingFacility, setSelectedSupplyingFacility] = useState('');
    const [noPartners, setNoPartners] = useState(false);

    const ADMINISTRATION_RIGHTS = useMemo(() => getService('ADMINISTRATION_RIGHTS'), []);
    const programService = useMemo(() => getService('programService'), []);
    const { formatMessage } = useMemo(() => getService('messageService'), []);
    const facilityService = useMemo(() => getService('facilityService'), []);
    const transferService = useMemo(() => getService('transferService'), []);

    const userId = useMemo(
        () => {
            const authorizationService = getService('authorizationService');
            return authorizationService.getUser().user_id;
        }, []
    );

    const createRequest = () => {
        const request = buildTransferRequest(selectedProgram, selectedRequestingFacility, selectedSupplyingFacility);
        goToRequestEdit(request, transferService, history);
    };

    useEffect(
        () => {
            programService.getUserPrograms(userId)
                .then((programs) => {
                    setProgramOptions(toOptions(programs));
                });
        },
        [programService]
    );

    useEffect(
        () => {
            facilityService.getUserFacilitiesForRight(userId, ADMINISTRATION_RIGHTS.ORDER_CREATE, true)
                .then((facilities) => {
                    setRequestingFacilityOptions(toOptions(facilities));
                });
        },
        [facilityService]
    );

    useEffect(
        () => {
            setSelectedSupplyingFacility('');
            setSupplyingFacilityOptions([]);
            setNoPartners(false);

            if (!selectedProgram || !selectedRequestingFacility) {
                return;
            }

            let cancelled = false;

            loadCurrentSupplierOptions(transferService, selectedProgram, selectedRequestingFacility,
                () => cancelled,
                ({ options, empty }) => {
                    setSupplyingFacilityOptions(options);
                    setNoPartners(empty);
                });

            return () => {
                cancelled = true;
            };
        },
        [selectedProgram, selectedRequestingFacility]
    );

    useEffect(
        () => {
            if (programOptions && programOptions.length === 1) {
                setSelectedProgram(programOptions[0].value);
            }
        },
        [programOptions]
    );

    useEffect(
        () => {
            if (requestingFacilityOptions && requestingFacilityOptions.length === 1) {
                setSelectedRequestingFacility(requestingFacilityOptions[0].value);
            }
        },
        [requestingFacilityOptions]
    );

    useEffect(
        () => {
            if (supplyingFacilityOptions && supplyingFacilityOptions.length === 1) {
                setSelectedSupplyingFacility(supplyingFacilityOptions[0].value);
            }
        },
        [supplyingFacilityOptions]
    );

    return (
        <div className="page-container">
            <div className="page-header-responsive">
                <h2> {formatMessage('transferRequest.create')} </h2>
            </div>
            <div className="page-content transfer-request-form">
                <div className={'section'}>
                    <div>
                      <strong className='is-required'>
                        {formatMessage('transferRequest.program')}
                      </strong>
                    </div>
                    <SearchSelect
                        options={programOptions}
                        value={selectedProgram}
                        onChange={value => setSelectedProgram(value)}
                        placeholder={formatMessage('transferRequest.program.placeholder')}
                    />
                </div>
                <div className={'section'}>
                    <div>
                      <strong className='is-required'>
                        {formatMessage('transferRequest.reqFacility')}
                      </strong>
                    </div>
                    <SearchSelect
                        options={requestingFacilityOptions}
                        value={selectedRequestingFacility}
                        onChange={value => setSelectedRequestingFacility(value)}
                        placeholder={formatMessage('transferRequest.reqFacility.placeholder')}
                    />
                </div>
                <div className={'section'}>
                    <div>
                      <strong className='is-required'>
                        {formatMessage('transferRequest.supFacility')}
                      </strong>
                    </div>
                    <SearchSelect
                        options={supplyingFacilityOptions}
                        value={selectedSupplyingFacility}
                        onChange={value => setSelectedSupplyingFacility(value)}
                        placeholder={formatMessage('transferRequest.supFacility.placeholder')}
                        disabled={!selectedProgram || !selectedRequestingFacility || noPartners}
                    />
                    {
                        noPartners &&
                        <div className="alert is-info">
                            {formatMessage('transferRequest.noPartners')}
                        </div>
                    }
                </div>
                <div>
                    <button
                        className="btn primary"
                        type="button"
                        style={{ marginTop: '0.5em' }}
                        disabled={!selectedProgram || !selectedRequestingFacility || !selectedSupplyingFacility}
                        onClick={createRequest}
                    >
                        {formatMessage('transferRequest.create')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferRequestForm;
