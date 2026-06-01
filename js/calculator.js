document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabIndiv = document.getElementById('tab-individual');
    const tabBiz = document.getElementById('tab-business');
    const secIndiv = document.getElementById('sec-individual');
    const secBiz = document.getElementById('sec-business');

    if (tabIndiv && tabBiz && secIndiv && secBiz) {
        tabIndiv.addEventListener('click', () => {
            tabIndiv.classList.add('active');
            tabBiz.classList.remove('active');
            secIndiv.classList.add('active');
            secBiz.classList.remove('active');
        });

        tabBiz.addEventListener('click', () => {
            tabBiz.classList.add('active');
            tabIndiv.classList.remove('active');
            secBiz.classList.add('active');
            secIndiv.classList.remove('active');
        });
    }

    // Individual Regime Toggle
    const regimeNew = document.getElementById('regime-new');
    const regimeOld = document.getElementById('regime-old');
    let currentRegime = 'new';

    if (regimeNew && regimeOld) {
        regimeNew.addEventListener('click', () => {
            currentRegime = 'new';
            regimeNew.classList.add('active');
            regimeOld.classList.remove('active');
            const wrapper = document.getElementById('deductions-wrapper');
            if (wrapper) wrapper.style.opacity = '0.5';
            const dedInput = document.getElementById('indiv-deductions');
            if (dedInput) dedInput.disabled = true;
            calculateIndividual();
        });

        regimeOld.addEventListener('click', () => {
            currentRegime = 'old';
            regimeOld.classList.add('active');
            regimeNew.classList.remove('active');
            const wrapper = document.getElementById('deductions-wrapper');
            if (wrapper) wrapper.style.opacity = '1';
            const dedInput = document.getElementById('indiv-deductions');
            if (dedInput) dedInput.disabled = false;
            calculateIndividual();
        });
    }

    // Dynamic Assets Storage arrays
    let individualAssets = [];
    let businessAssets = [];

    const assetRates = {
        computers: { label: 'Computers (40% Dep.)', rate: 0.40 },
        machinery: { label: 'Machinery (15% Dep.)', rate: 0.15 },
        furniture: { label: 'Furniture (10% Dep.)', rate: 0.10 }
    };

    // DOM Elements for Assets
    const btnAddIndiv = document.getElementById('btn-add-indiv-asset');
    const btnAddBiz = document.getElementById('btn-add-biz-asset');

    if (btnAddIndiv) {
        btnAddIndiv.addEventListener('click', () => {
            const typeEl = document.getElementById('indiv-asset-type');
            const nameEl = document.getElementById('indiv-asset-name');
            const valEl = document.getElementById('indiv-asset-value');

            if (typeEl && valEl) {
                const val = parseFloat(valEl.value) || 0;
                if (val <= 0) return;

                const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : assetRates[typeEl.value].label.split(' ')[0];
                individualAssets.push({
                    type: typeEl.value,
                    name: name,
                    value: val
                });

                if (nameEl) nameEl.value = '';
                valEl.value = '';
                renderIndividualAssets();
                calculateIndividual();
            }
        });
    }

    if (btnAddBiz) {
        btnAddBiz.addEventListener('click', () => {
            const typeEl = document.getElementById('biz-asset-type');
            const nameEl = document.getElementById('biz-asset-name');
            const valEl = document.getElementById('biz-asset-value');

            if (typeEl && valEl) {
                const val = parseFloat(valEl.value) || 0;
                if (val <= 0) return;

                const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : assetRates[typeEl.value].label.split(' ')[0];
                businessAssets.push({
                    type: typeEl.value,
                    name: name,
                    value: val
                });

                if (nameEl) nameEl.value = '';
                valEl.value = '';
                renderBusinessAssets();
                calculateBusiness();
            }
        });
    }

    function renderIndividualAssets() {
        const container = document.getElementById('indiv-asset-list-container');
        const list = document.getElementById('indiv-asset-list');
        const count = document.getElementById('indiv-asset-count');

        if (!container || !list || !count) return;

        if (individualAssets.length === 0) {
            container.style.display = 'none';
            list.innerHTML = '';
            count.innerText = '0 Assets';
            return;
        }

        container.style.display = 'block';
        count.innerText = `${individualAssets.length} Asset${individualAssets.length > 1 ? 's' : ''}`;
        list.innerHTML = individualAssets.map((asset, index) => {
            const depVal = asset.value * assetRates[asset.type].rate;
            return `
                <div class="asset-item">
                    <div class="asset-item-info">
                        <span class="asset-badge">${assetRates[asset.type].label}</span>
                        <strong>${asset.name}</strong>
                        <span style="color:var(--text-muted)">Value: ₹${asset.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-weight:600">Dep: ₹${Math.round(depVal).toLocaleString('en-IN')}</span>
                        <button type="button" class="btn-delete-asset" data-index="${index}"><i class="ph ph-trash" style="font-size: 1.1rem;"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-delete-asset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                individualAssets.splice(idx, 1);
                renderIndividualAssets();
                calculateIndividual();
            });
        });
    }

    function renderBusinessAssets() {
        const container = document.getElementById('biz-asset-list-container');
        const list = document.getElementById('biz-asset-list');
        const count = document.getElementById('biz-asset-count');

        if (!container || !list || !count) return;

        if (businessAssets.length === 0) {
            container.style.display = 'none';
            list.innerHTML = '';
            count.innerText = '0 Assets';
            return;
        }

        container.style.display = 'block';
        count.innerText = `${businessAssets.length} Asset${businessAssets.length > 1 ? 's' : ''}`;
        list.innerHTML = businessAssets.map((asset, index) => {
            const depVal = asset.value * assetRates[asset.type].rate;
            return `
                <div class="asset-item">
                    <div class="asset-item-info">
                        <span class="asset-badge">${assetRates[asset.type].label}</span>
                        <strong>${asset.name}</strong>
                        <span style="color:var(--text-muted)">Value: ₹${asset.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-weight:600">Dep: ₹${Math.round(depVal).toLocaleString('en-IN')}</span>
                        <button type="button" class="btn-delete-asset" data-index="${index}"><i class="ph ph-trash" style="font-size: 1.1rem;"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-delete-asset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                businessAssets.splice(idx, 1);
                renderBusinessAssets();
                calculateBusiness();
            });
        });
    }

    // Input Listeners
    const indivInputs = ['indiv-income', 'indiv-age', 'indiv-deductions'];
    indivInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateIndividual);
            el.addEventListener('change', calculateIndividual);
        }
    });

    const bizInputs = ['biz-profit', 'biz-type', 'biz-turnover'];
    bizInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateBusiness);
            el.addEventListener('change', calculateBusiness);
        }
    });

    function calculateIndividual() {
        const grossInput = document.getElementById('indiv-income');
        if (!grossInput) return;

        const gross = parseFloat(grossInput.value) || 0;
        const ageEl = document.getElementById('indiv-age');
        const age = ageEl ? ageEl.value : '<60';

        const dedEl = document.getElementById('indiv-deductions');
        const deductions = currentRegime === 'old' ? (parseFloat(dedEl ? dedEl.value : 0) || 0) : 0;

        // Sum up dynamic assets depreciation
        let totalDepreciation = 0;
        individualAssets.forEach(asset => {
            totalDepreciation += asset.value * assetRates[asset.type].rate;
        });

        // Apply standard deduction u/s 16(ia) - ₹75,000 for New, ₹50,000 for Old
        let standardDeduction = currentRegime === 'new' ? 75000 : 50000;

        let taxable = gross - deductions - standardDeduction - totalDepreciation;
        if (taxable < 0) taxable = 0;

        let baseTax = 0;

        if (currentRegime === 'new') {
            // New Regime Slabs (FY 2024-25 / FY 2025-26 rules)
            // Income up to 3 Lakh: Nil
            // 3L to 6L: 5%
            // 6L to 9L: 10%
            // 9L to 12L: 15%
            // 12L to 15L: 20%
            // Above 15L: 30%
            if (taxable > 1500000) baseTax = (taxable - 1500000) * 0.30 + 150000;
            else if (taxable > 1200000) baseTax = (taxable - 1200000) * 0.20 + 90000;
            else if (taxable > 900000) baseTax = (taxable - 900000) * 0.15 + 45000;
            else if (taxable > 600000) baseTax = (taxable - 600000) * 0.10 + 15000;
            else if (taxable > 300000) baseTax = (taxable - 300000) * 0.05;

            // Section 87A rebate for New Regime (Rebate on taxable income up to 7 Lakhs)
            if (taxable <= 700000) {
                baseTax = 0;
            }
        } else {
            // Old Regime Slabs
            let exemption = 250000;
            if (age === '60-80') exemption = 300000;
            if (age === '80+') exemption = 500000;

            if (taxable > 1000000) {
                baseTax = (taxable - 1000000) * 0.30 + 112500;
            } else if (taxable > 500000) {
                baseTax = (taxable - 500000) * 0.20 + 12500;
            } else if (taxable > exemption) {
                baseTax = (taxable - exemption) * 0.05;
            }

            // Section 87A rebate for Old Regime (Rebate on taxable income up to 5 Lakhs)
            if (taxable <= 500000) {
                baseTax = Math.max(0, baseTax - 12500);
            }
        }

        // Surcharge
        let surcharge = 0;
        if (taxable > 20000000) surcharge = baseTax * 0.25;
        else if (taxable > 10000000) surcharge = baseTax * 0.15;
        else if (taxable > 5000000) surcharge = baseTax * 0.10;

        const cess = (baseTax + surcharge) * 0.04;
        const totalTax = baseTax + surcharge + cess;
        const effectiveRate = gross > 0 ? ((totalTax / gross) * 100).toFixed(2) : 0;

        // Render Results
        const resTaxable = document.getElementById('res-indiv-taxable');
        if (resTaxable) resTaxable.innerText = '₹' + Math.round(taxable).toLocaleString('en-IN');

        const resTax = document.getElementById('res-indiv-tax');
        if (resTax) resTax.innerText = '₹' + Math.round(totalTax).toLocaleString('en-IN');

        const resRate = document.getElementById('res-indiv-rate');
        if (resRate) resRate.innerText = effectiveRate + '%';

        const breakdown = document.getElementById('indiv-breakdown');
        if (breakdown) {
            breakdown.innerHTML = `
                <div class="breakdown-row"><span>Gross Base Tax</span> <span>₹${Math.round(baseTax).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Standard Deduction (u/s 16)</span> <span>- ₹${standardDeduction.toLocaleString('en-IN')}</span></div>
                ${totalDepreciation > 0 ? `<div class="breakdown-row"><span>Asset Depreciation Deduction</span> <span style="color:#2e7d32">- ₹${Math.round(totalDepreciation).toLocaleString('en-IN')}</span></div>` : ''}
                <div class="breakdown-row"><span>Surcharge</span> <span>₹${Math.round(surcharge).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Health & Education Cess (4%)</span> <span>₹${Math.round(cess).toLocaleString('en-IN')}</span></div>
            `;
        }
    }

    function calculateBusiness() {
        const profitInput = document.getElementById('biz-profit');
        if (!profitInput) return;

        const profit = parseFloat(profitInput.value) || 0;
        const typeEl = document.getElementById('biz-type');
        const bizType = typeEl ? typeEl.value : 'pvt';
        const turnoverEl = document.getElementById('biz-turnover');
        const turnover = parseFloat(turnoverEl ? turnoverEl.value : 0) || 0;

        // Sum up dynamic assets depreciation
        let totalDepreciation = 0;
        businessAssets.forEach(asset => {
            totalDepreciation += asset.value * assetRates[asset.type].rate;
        });

        // Compute taxable profit after depreciation deduction
        const taxableProfit = Math.max(0, profit - totalDepreciation);

        let tax = 0;
        let surcharge = 0;
        let showMat = false;
        let entityName = 'Corporate';

        if (bizType === 'proprietorship') {
            entityName = 'Individual';
            // Proprietorship is taxed as per Individual slab (simplified overall view)
            if (taxableProfit > 1000000) tax = (taxableProfit - 1000000) * 0.30 + 112500;
            else if (taxableProfit > 500000) tax = (taxableProfit - 500000) * 0.20 + 12500;
            else if (taxableProfit > 250000) tax = (taxableProfit - 250000) * 0.05;

            // Rebate 87A
            if (taxableProfit <= 500000) tax = Math.max(0, tax - 12500);

            if (taxableProfit > 20000000) surcharge = tax * 0.25;
            else if (taxableProfit > 10000000) surcharge = tax * 0.15;
            else if (taxableProfit > 5000000) surcharge = tax * 0.10;
        } else if (bizType === 'llp') {
            entityName = 'Partnership/LLP';
            // LLPs & Firms are taxed at flat 30%
            tax = taxableProfit * 0.30;
            if (taxableProfit > 10000000) surcharge = tax * 0.12; // 12% if profit > 1 Crore
            showMat = true;
        } else if (bizType === 'compf') {
            entityName = 'Foreign Company';
            // Foreign Companies are taxed at flat 40%
            tax = taxableProfit * 0.40;
            if (taxableProfit > 100000000) surcharge = tax * 0.05; // 5% if profit > 10 Crore
            else if (taxableProfit > 10000000) surcharge = tax * 0.02; // 2% if profit > 1 Crore
        } else if (bizType.startsWith('coop')) {
            entityName = 'Co-operative';
            if (bizType === 'coop115bad') {
                // Section 115BAD flat tax at 22%
                tax = taxableProfit * 0.22;
                surcharge = tax * 0.10; // flat 10%
            } else if (bizType === 'coop115bae') {
                // Section 115BAE flat tax at 15%
                tax = taxableProfit * 0.15;
                surcharge = tax * 0.10; // flat 10%
            } else {
                // Normal Cooperative slabs
                if (taxableProfit > 20000) tax = (taxableProfit - 20000) * 0.30 + 3000;
                else if (taxableProfit > 10000) tax = (taxableProfit - 10000) * 0.20 + 1000;
                else tax = taxableProfit * 0.10;

                if (taxableProfit > 100000000) surcharge = tax * 0.12;
                else if (taxableProfit > 10000000) surcharge = tax * 0.07;
            }
        } else {
            entityName = 'Domestic Company';
            // Domestic Companies
            // Base tax rate 25% if turnover is up to 400 Crore, otherwise 30%
            let rate = (turnover <= 4000000000) ? 0.25 : 0.30;
            tax = taxableProfit * rate;

            if (taxableProfit > 100000000) surcharge = tax * 0.12; // 12% if profit > 10 Crore
            else if (taxableProfit > 10000000) surcharge = tax * 0.07; // 7% if profit > 1 Crore
            showMat = true;
        }

        const cess = (tax + surcharge) * 0.04;
        const totalTax = tax + surcharge + cess;
        const effectiveRate = profit > 0 ? ((totalTax / profit) * 100).toFixed(2) : 0;

        // Render Results
        const resTaxable = document.getElementById('res-biz-taxable');
        if (resTaxable) resTaxable.innerText = '₹' + Math.round(taxableProfit).toLocaleString('en-IN');

        const resTax = document.getElementById('res-biz-tax');
        if (resTax) resTax.innerText = '₹' + Math.round(totalTax).toLocaleString('en-IN');

        const resRate = document.getElementById('res-biz-rate');
        if (resRate) resRate.innerText = effectiveRate + '%';

        const breakdown = document.getElementById('biz-breakdown');
        if (breakdown) {
            let breakdownHTML = `
                <div class="breakdown-row"><span>Entity Type</span> <strong>${entityName}</strong></div>
                <div class="breakdown-row"><span>Gross Base Tax</span> <span>₹${Math.round(tax).toLocaleString('en-IN')}</span></div>
                ${totalDepreciation > 0 ? `<div class="breakdown-row"><span>Asset Depreciation Deduction</span> <span style="color:#2e7d32">- ₹${Math.round(totalDepreciation).toLocaleString('en-IN')}</span></div>` : ''}
                <div class="breakdown-row"><span>Surcharge</span> <span>₹${Math.round(surcharge).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Health & Education Cess (4%)</span> <span>₹${Math.round(cess).toLocaleString('en-IN')}</span></div>
            `;
            if (showMat && taxableProfit > 0) {
                const mat = taxableProfit * 0.15;
                breakdownHTML += `<div class="breakdown-row mt-1" style="color:var(--text-muted); font-size:0.85rem"><span>Note: MAT / AMT @ 15% would be</span> <span>₹${Math.round(mat).toLocaleString('en-IN')}</span></div>`;
            }
            breakdown.innerHTML = breakdownHTML;
        }
    }

    calculateIndividual();
    calculateBusiness();
});
