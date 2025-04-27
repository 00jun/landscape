// 주민등록번호 형식 지정 함수
function formatResidentId(input) {
    // 숫자만 추출
    let value = input.value.replace(/[^\d]/g, '');
    
    // 주민등록번호 형식 (123456-1234567)
    if (value.length > 6) {
        value = value.replace(/(\d{6})(\d+)/, '$1-$2');
    }
    
    // 최대 13자리 (6자리-7자리)로 제한
    if (value.length > 14) {
        value = value.substring(0, 14);
    }
    
    input.value = value;
}

// 전화번호 형식 지정 함수
function formatPhoneNumber(input) {
    // 숫자만 추출
    let value = input.value.replace(/[^\d]/g, '');
    
    // 길이에 따라 하이픈 추가
    if (value.length > 0) {
        // 지역번호 선택값 가져오기
        const prefixValue = input.parentNode.querySelector('select').value;
        
        // 입력한 숫자만 포맷팅
        if (prefixValue.length === 2) { // 서울 (02)
            if (value.length <= 4) {
                // 4자리 이하는 그대로 표시
                // 예: 123
            } else if (value.length <= 7) {
                // 5-7자리는 3-4 형식
                value = value.replace(/(\d{3})(\d+)/, '$1-$2');
                // 예: 123-4
            } else {
                // 8자리 이상은 4-4 형식으로 제한
                value = value.replace(/(\d{4})(\d{0,4}).*/, '$1-$2');
                // 예: 1234-5678
            }
        } else if (prefixValue === '010') { // 휴대폰
            if (value.length <= 4) {
                // 4자리 이하는 그대로 표시
                // 예: 123
            } else if (value.length <= 8) {
                // 5-8자리는 4-4 형식
                value = value.replace(/(\d{4})(\d+)/, '$1-$2');
                // 예: 1234-5
            } else {
                // 9자리 이상은 4-4 형식으로 제한
                value = value.replace(/(\d{4})(\d{0,4}).*/, '$1-$2');
                // 예: 1234-5678
            }
        } else { // 지역번호나 기타 (031, 064 등)
            if (value.length <= 3) {
                // 3자리 이하는 그대로 표시
                // 예: 12
            } else if (value.length <= 6) {
                // 4-6자리는 3-3 형식
                value = value.replace(/(\d{3})(\d+)/, '$1-$2');
                // 예: 123-4
            } else {
                // 7자리 이상은 3-4 형식으로 제한
                value = value.replace(/(\d{3})(\d{0,4}).*/, '$1-$2');
                // 예: 123-4567
            }
        }
    }
    
    input.value = value;
}

function formatMoney(input) {
    // Remove any non-digit characters
    const numericValue = input.value.replace(/[^\d]/g, '');
    
    // Format the number with commas
    if (numericValue.length > 0) {
        const formattedValue = Number(numericValue).toLocaleString();
        input.value = formattedValue;
    } else {
        input.value = '';
    }
}

// 중개사 프로필 관련 함수
function saveAgentProfile() {
    const agentName = document.getElementById('agentName').value.trim();
    if (!agentName) {
        alert('중개사 이름을 입력해주세요.');
        return;
    }
    
    const officeName = document.getElementById('officeName').value.trim();
    const regNumber = document.getElementById('regNumber').value.trim();
    const agentPhonePrefix = document.getElementById('agentPhonePrefix').value;
    const agentPhone = document.getElementById('agentPhone').value.trim();
    
    // 프로필 객체 생성
    const profile = {
        name: agentName,
        officeName: officeName,
        regNumber: regNumber,
        phonePrefix: agentPhonePrefix,
        phone: agentPhone
    };
    
    // 로컬 스토리지에서 기존 프로필 불러오기
    let agentProfiles = JSON.parse(localStorage.getItem('agentProfiles')) || [];
    
    // 동일한 이름의 프로필이 있으면 업데이트, 없으면 추가
    const existingIndex = agentProfiles.findIndex(p => p.name === agentName);
    if (existingIndex >= 0) {
        agentProfiles[existingIndex] = profile;
    } else {
        agentProfiles.push(profile);
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('agentProfiles', JSON.stringify(agentProfiles));
    
    // 프로필 목록 다시 로드
    loadAgentProfiles();
    
    alert('중개사 프로필이 저장되었습니다.');
}

function loadAgentProfiles() {
    const agentList = document.getElementById('agentList');
    agentList.innerHTML = ''; // 기존 목록 비우기
    
    // 로컬 스토리지에서 프로필 불러오기
    const agentProfiles = JSON.parse(localStorage.getItem('agentProfiles')) || [];
    
    if (agentProfiles.length === 0) {
        agentList.innerHTML = '<div class="list-item-empty">저장된 중개사가 없습니다.</div>';
        return;
    }
    
    // 프로필 목록 생성
    agentProfiles.forEach(profile => {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'list-item';
        profileDiv.setAttribute('data-name', profile.name);
        profileDiv.textContent = `${profile.name} (${profile.officeName || '사무소명 없음'})`;
        
        // 프로필 선택 이벤트
        profileDiv.addEventListener('click', function() {
            // 이전에 선택된 항목의 선택 상태 제거
            document.querySelectorAll('#agentList .list-item.selected').forEach(item => {
                item.classList.remove('selected');
            });
            
            // 선택된 항목에 선택 상태 표시
            this.classList.add('selected');
            
            // 선택된 프로필 정보로 폼 채우기
            fillAgentForm(profile);
        });
        
        agentList.appendChild(profileDiv);
    });
}

function fillAgentForm(profile) {
    // 중개사 정보 채우기
    document.getElementById('agentName').value = profile.name || '';
    document.getElementById('officeName').value = profile.officeName || '';
    document.getElementById('regNumber').value = profile.regNumber || '';
    
    if (profile.phonePrefix) {
        document.getElementById('agentPhonePrefix').value = profile.phonePrefix;
    }
    
    document.getElementById('agentPhone').value = profile.phone || '';
}

function deleteAgentProfile() {
    const selectedItem = document.querySelector('#agentList .list-item.selected');
    if (!selectedItem) {
        alert('삭제할 중개사를 선택해주세요.');
        return;
    }
    
    const agentName = selectedItem.getAttribute('data-name');
    
    if (confirm(`"${agentName}" 중개사 프로필을 삭제하시겠습니까?`)) {
        // 로컬 스토리지에서 프로필 불러오기
        let agentProfiles = JSON.parse(localStorage.getItem('agentProfiles')) || [];
        
        // 선택된 프로필 삭제
        agentProfiles = agentProfiles.filter(profile => profile.name !== agentName);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('agentProfiles', JSON.stringify(agentProfiles));
        
        // 프로필 목록 다시 로드
        loadAgentProfiles();
        
        alert('중개사 프로필이 삭제되었습니다.');
    }
}

// 임대인 프로필 관련 함수
function saveLandlordProfile() {
    const sellerName = document.getElementById('sellerName').value.trim();
    if (!sellerName) {
        alert('임대인 이름을 입력해주세요.');
        return;
    }
    
    const sellerId = document.getElementById('sellerId').value.trim();
    const sellerPhonePrefix = document.getElementById('sellerPhonePrefix').value;
    const sellerPhone = document.getElementById('sellerPhone').value.trim();
    
    // 계좌이체 정보 추가
    const bankName = document.getElementById('bankName').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const accountHolder = document.getElementById('accountHolder').value.trim();
    
    // 프로필 객체 생성
    const profile = {
        name: sellerName,
        id: sellerId,
        phonePrefix: sellerPhonePrefix,
        phone: sellerPhone,
        // 계좌이체 정보 추가
        bankName: bankName,
        accountNumber: accountNumber,
        accountHolder: accountHolder
    };
    
    // 로컬 스토리지에서 기존 프로필 불러오기
    let landlordProfiles = JSON.parse(localStorage.getItem('landlordProfiles')) || [];
    
    // 동일한 이름의 프로필이 있으면 업데이트, 없으면 추가
    const existingIndex = landlordProfiles.findIndex(p => p.name === sellerName);
    if (existingIndex >= 0) {
        landlordProfiles[existingIndex] = profile;
    } else {
        landlordProfiles.push(profile);
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('landlordProfiles', JSON.stringify(landlordProfiles));
    
    // 프로필 목록 다시 로드
    loadLandlordProfiles();
    
    alert('임대인 프로필이 저장되었습니다.');
}

function loadLandlordProfiles() {
    const landlordList = document.getElementById('landlordList');
    landlordList.innerHTML = ''; // 기존 목록 비우기
    
    // 로컬 스토리지에서 프로필 불러오기
    const landlordProfiles = JSON.parse(localStorage.getItem('landlordProfiles')) || [];
    
    if (landlordProfiles.length === 0) {
        landlordList.innerHTML = '<div class="list-item-empty">저장된 임대인이 없습니다.</div>';
        return;
    }
    
    // 프로필 목록 생성
    landlordProfiles.forEach(profile => {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'list-item';
        profileDiv.setAttribute('data-name', profile.name);
        profileDiv.textContent = profile.name;
        
        // 프로필 선택 이벤트
        profileDiv.addEventListener('click', function() {
            // 이전에 선택된 항목의 선택 상태 제거
            document.querySelectorAll('#landlordList .list-item.selected').forEach(item => {
                item.classList.remove('selected');
            });
            
            // 선택된 항목에 선택 상태 표시
            this.classList.add('selected');
            
            // 선택된 프로필 정보로 폼 채우기
            fillLandlordForm(profile);
        });
        
        landlordList.appendChild(profileDiv);
    });
}

function fillLandlordForm(profile) {
    // 임대인 정보 채우기
    document.getElementById('sellerName').value = profile.name || '';
    document.getElementById('sellerId').value = profile.id || '';
    
    if (profile.phonePrefix) {
        document.getElementById('sellerPhonePrefix').value = profile.phonePrefix;
    }
    
    document.getElementById('sellerPhone').value = profile.phone || '';
    
    // 계좌이체 정보 채우기
    document.getElementById('bankName').value = profile.bankName || '';
    document.getElementById('accountNumber').value = profile.accountNumber || '';
    document.getElementById('accountHolder').value = profile.accountHolder || '';
}

function deleteLandlordProfile() {
    const selectedItem = document.querySelector('#landlordList .list-item.selected');
    if (!selectedItem) {
        alert('삭제할 임대인을 선택해주세요.');
        return;
    }
    
    const landlordName = selectedItem.getAttribute('data-name');
    
    if (confirm(`"${landlordName}" 임대인 프로필을 삭제하시겠습니까?`)) {
        // 로컬 스토리지에서 프로필 불러오기
        let landlordProfiles = JSON.parse(localStorage.getItem('landlordProfiles')) || [];
        
        // 선택된 프로필 삭제
        landlordProfiles = landlordProfiles.filter(profile => profile.name !== landlordName);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('landlordProfiles', JSON.stringify(landlordProfiles));
        
        // 프로필 목록 다시 로드
        loadLandlordProfiles();
        
        alert('임대인 프로필이 삭제되었습니다.');
    }
}

function createContract() {
    // 양쪽 사이드바 숨기기
    const sidePanels = document.querySelectorAll('.side-panel');
    sidePanels.forEach(panel => {
        panel.style.display = 'none';
    });
    
    // 메인 콘텐츠 전체 너비로 설정
    document.querySelector('.main-content').style.width = '100%';
    
    // Hide input form and show output form
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('outputForm').style.display = 'block';
    
    // Fill the contract with data from input form
    fillContractData();
}

function fillContractData() {
    // 부동산 정보
    const propertyAddress = document.getElementById('propertyAddress').value;
    
    // 계약 조건
    const contractType = document.querySelector('input[name="contractType"]:checked').value;
    const contractAmount = document.getElementById('contractAmount').value;
    const contractDate = document.getElementById('contractDate').value;
    const additionalConditions = document.getElementById('additionalConditions').value;
    
    // 계좌이체 정보
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const accountHolder = document.getElementById('accountHolder').value;
    
    // 계좌이체 정보 텍스트 구성
    let accountInfo = '';
    if (bankName || accountNumber || accountHolder) {
        accountInfo = `${bankName} ${accountNumber} (예금주: ${accountHolder})`;
    }
    
    // 계약금
    const depositAmount = document.getElementById('depositAmount').value;
    
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
    let formattedContractDate = '';
    let formattedSignDate = '';
    
    if (contractDate) {
        const dateParts = contractDate.split('-');
        formattedContractDate = `${dateParts[0]}년 ${dateParts[1]}월 ${dateParts[2]}일`;
    }
    
    const signDate = document.getElementById('signDate').value;
    if (signDate) {
        const signDateParts = signDate.split('-');
        formattedSignDate = `${signDateParts[0]}년 ${signDateParts[1]}월 ${signDateParts[2]}일`;
    }
    
    // 매도인/임대인 정보
    const sellerName = document.getElementById('sellerName').value;
    const sellerId = document.getElementById('sellerId').value;
    const sellerPhonePrefix = document.getElementById('sellerPhonePrefix').value;
    const sellerPhone = document.getElementById('sellerPhone').value.trim();
    let formattedSellerPhone = '';
    if (sellerPhone) {
        formattedSellerPhone = `${sellerPhonePrefix}-${sellerPhone}`;
    }
    
    // 매수인/임차인 정보
    const buyerName = document.getElementById('buyerName').value;
    const buyerId = document.getElementById('buyerId').value;
    const buyerPhonePrefix = document.getElementById('buyerPhonePrefix').value;
    const buyerPhone = document.getElementById('buyerPhone').value.trim();
    let formattedBuyerPhone = '';
    if (buyerPhone) {
        formattedBuyerPhone = `${buyerPhonePrefix}-${buyerPhone}`;
    }
    
    // 중개사 정보
    const agentName = document.getElementById('agentName').value;
    const officeName = document.getElementById('officeName').value;
    const regNumber = document.getElementById('regNumber').value;
    const agentPhonePrefix = document.getElementById('agentPhonePrefix').value;
    const agentPhone = document.getElementById('agentPhone').value.trim();
    let formattedAgentPhone = '';
    if (agentPhone) {
        formattedAgentPhone = `${agentPhonePrefix}-${agentPhone}`;
    }
    
    // 상단 계약서 채우기
    document.getElementById('output_property1').textContent = propertyAddress;
    document.getElementById('output_contract_type1').textContent = contractType;
    document.getElementById('output_amount1').textContent = contractAmount;
    document.getElementById('output_contract_date1').textContent = formattedContractDate;
    
    // 부가조건과 계좌정보 분리
    document.getElementById('output_conditions1').innerHTML = additionalConditions.replace(/\n/g, '<br>');
    document.getElementById('output_account_info1').textContent = accountInfo;
    
    document.getElementById('output_seller_name1').innerHTML = `${sellerName} (印)`;
    document.getElementById('output_seller_phone1').textContent = formattedSellerPhone;
    document.getElementById('output_seller_id1').textContent = sellerId;
    
    document.getElementById('output_buyer_name1').innerHTML = `${buyerName} (印)`;
    document.getElementById('output_buyer_phone1').textContent = formattedBuyerPhone;
    document.getElementById('output_buyer_id1').textContent = buyerId;
    
    document.getElementById('output_agent_name1').innerHTML = `${agentName} (印)`;
    document.getElementById('output_office_name1').textContent = officeName;
    document.getElementById('output_reg_number1').textContent = regNumber;
    document.getElementById('output_agent_phone1').textContent = formattedAgentPhone;
    
    document.getElementById('output_deposit_amount1').textContent = depositAmount;
    document.getElementById('output_sign_date1').textContent = formattedSignDate;
    
    // 하단 계약서 채우기 (상단과 동일)
    document.getElementById('output_property2').textContent = propertyAddress;
    document.getElementById('output_contract_type2').textContent = contractType;
    document.getElementById('output_amount2').textContent = contractAmount;
    document.getElementById('output_contract_date2').textContent = formattedContractDate;
    
    // 부가조건과 계좌정보 분리
    document.getElementById('output_conditions2').innerHTML = additionalConditions.replace(/\n/g, '<br>');
    document.getElementById('output_account_info2').textContent = accountInfo;
    
    document.getElementById('output_seller_name2').innerHTML = `${sellerName} (印)`;
    document.getElementById('output_seller_phone2').textContent = formattedSellerPhone;
    document.getElementById('output_seller_id2').textContent = sellerId;
    
    document.getElementById('output_buyer_name2').innerHTML = `${buyerName} (印)`;
    document.getElementById('output_buyer_phone2').textContent = formattedBuyerPhone;
    document.getElementById('output_buyer_id2').textContent = buyerId;
    
    document.getElementById('output_agent_name2').innerHTML = `${agentName} (印)`;
    document.getElementById('output_office_name2').textContent = officeName;
    document.getElementById('output_reg_number2').textContent = regNumber;
    document.getElementById('output_agent_phone2').textContent = formattedAgentPhone;
    
    document.getElementById('output_deposit_amount2').textContent = depositAmount;
    document.getElementById('output_sign_date2').textContent = formattedSignDate;
}

function printContract() {
    // 양쪽 사이드바 숨기기
    const sidePanels = document.querySelectorAll('.side-panel');
    sidePanels.forEach(panel => {
        panel.style.display = 'none';
    });
    
    // 메인 콘텐츠 전체 너비로 설정
    document.querySelector('.main-content').style.width = '100%';
    
    fillContractData();
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('outputForm').style.display = 'block';
    setTimeout(function() {
        window.print();
        setTimeout(function() {
            document.getElementById('inputForm').style.display = 'block';
            document.getElementById('outputForm').style.display = 'none';
            
            // 돌아가기 버튼 클릭시 사이드바 다시 표시하지 않도록 별도 처리
        }, 1000);
    }, 500);
}

function goBack() {
    // 사이드바 다시 표시
    const sidePanels = document.querySelectorAll('.side-panel');
    sidePanels.forEach(panel => {
        panel.style.display = 'block';
    });
    
    // 메인 콘텐츠 원래 스타일로 복원
    document.querySelector('.main-content').style.width = '';
    
    document.getElementById('inputForm').style.display = 'block';
    document.getElementById('outputForm').style.display = 'none';
} 