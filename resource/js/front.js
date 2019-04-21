var MYAPP = MYAPP || {};

// MYAPP의 프로퍼티 중복 방지
MYAPP.namespace = function (obj_name) {
	var parts = obj_name.split("."),
		parent = MYAPP,
		i;

	// 처음에 중복되는 전역 객체명은 제거
	if(parts[0] === "MYAPP"){
		parts = parts.slice(1);
	}	

	for(i=0; i<parts.length; i++){
		// 프로퍼티가 존재하지 않으면 생성한다.
		if(typeof parent[parts[i]] === "undefined"){
			parent[parts[i]] = {};
		}

		parent = parent[parts[i]];
	}
	return parent;
};

//---------------------MYAPP Start----------------------------------------//
(function(app, $){
	app.namespace("selectorManager");
	app.selectorManager = {
		"minWidth":1200,
		"body":$("body"),
		"header":$("#header"),
		"lnb":$("#lnb"),
		"container": $("#container"),
        "mask": $("#mask")
	}

    // Message
	app.namespace("messageEdit");
	app.messageEdit = (function () {
	    var currentPos = 0,
		    smsBytes = 90,
            lmsBytes = 2000,
		    lmsOk = false,				// lms 사용여부 사용자에게 확인	
            loading = true;             // 처음 로딩될 때 실행될 수 있도록    

	    // 메세지 생성자
	    var Message = function (obj) {
	        this._inputArea = obj.inputArea,
            this._viewArea = obj.viewArea,
            this._macroArea = obj.macroArea;
	    };

	    var fn = Message.prototype;			// 프로토타입 축약형

	    var _init = function (obj) {
	        var msg = new Message(obj);

	        msg._inputText();
	        msg._inputMacro();
	        msg._viewType();

	        return msg;
	    };

	    //로딩시 기존 입력문구들 SMS/LMS/MMS 체크함수
	    fn._viewType = function () {
	        var $ele = $(this._inputArea);

	        _calByte($ele.val());
	    };

	    // 텍스트 입력
	    fn._inputText = function () {
	        var $this = this,
                $inputArea = $(this._inputArea),
                $viewArea = $(this._viewArea);

	        $inputArea.keyup(function (e) {
	            var str = $(this).val().replace(/\n/g, "<br/>").replace(/\[#(.*?)\#]/g, "<strong>$1</strong>");
	            $viewArea.html(str);

	            _calByte($(this).val());
	        });
	    };

	    // 매크로 입력
	    fn._inputMacro = function () {
	        var $this = this;
	        var $inputArea = $(this._inputArea),
                $viewArea = $(this._viewArea),
                $macroArea = $(this._macroArea);

	        $macroArea.find(".btn").click(function () {
	            var text = $(this).text();
	            var macro;
	            var inputVal = $inputArea.val();

	            if ($(this).hasClass("no_macro")) {         // 매크로 형태로 추가되지 않는 버튼 클릭 시
	                macro = _changeMacroTxt("[#" + text + "#]");
	            } else {
	                macro = "[#" + text + "#]";
	            }

	            var val = _detectPosition($inputArea, macro);
	            $inputArea.val(val);
	            _calByte(val);

	            val = $inputArea.val().replace(/\n/g, "<br/>").replace(/\[#(.*?)\#]/g, "<strong>$1</strong>");
	            $viewArea.html(val);
	        });
	    };

	    // 현재 커서 위치에 텍스트 입력 가능하도록
	    var _detectPosition = function ($inputArea, text) {
	        var $inputArea = $inputArea,
                val = $inputArea.val(),
                valEnd = val.length,
                newVal = "";

	        currentPos = $inputArea[0].selectionStart;
	        if (currentPos == 0) {
	            currentPos = val.length;
	        }

	        newVal = val.substring(0, currentPos) + text + val.substring(currentPos, valEnd);

	        return newVal;
	    };

	    // SMS, LMS 문자 바이트 계산 - 텍스트만 계산
	    var _calByte = function (txt) {
	        var val = txt,
                length = 0,
                allBytes = 0;

	        val = val + _calByteMacro(val);
	        val = val.replace(/\[#(.*)\#]/g, "");		// 텍스트에서 매크로 삭제

	        length = val.length;

	        for (var i = 0; i < length; i++) {
	            var letter = escape(val.charAt(i));
	            if (letter.length == 1) {
	                allBytes++;
	            } else if (letter.indexOf("%u") != -1) {
	                allBytes += 2;
	            } else if (letter.indexOf("%") != -1) {
	                allBytes++;
	            }
	        }

	        _checkMmsType(allBytes);
	        loading = false;
	    };

	    // SMS, LMS 체크
	    var _checkMmsType = function (curByte) {
	        var $smsCheck = $(".sms_check");        // sms, lms 체크영역
	        var allBytes = curByte;

	        if (allBytes >= smsBytes) {
	            if (!lmsOk && !loading) {
	                lmsOk = window.confirm("SMS 발송 최대글자수를 초과하여 LMS로 전환됩니다.");
	            }
	            $smsCheck.find(".sms").removeClass("on");
	            $smsCheck.find(".lms").addClass("on");
	        } else if (allBytes == 0) {
	            $smsCheck.find(".sms").removeClass("on");
	            $smsCheck.find(".lms").removeClass("on");
	        } else {
	            lmsOk = false;
	            $smsCheck.find(".sms").addClass("on");
	            $smsCheck.find(".lms").removeClass("on");
	        }

	        if (allBytes > lmsBytes) {
	            window.alert("LMS 발송 최대 글자수를 초과합니다.");
	        }
	    };

	    // SMS, LMS 문자 바이트 계산 - 매크로 계산
	    var _calByteMacro = function (txt) {
	        var val = txt,
                macroTxt = "";

	        val = txt.match(/\[#(.*?)\#]/ig);

	        for (var i in val) {
	            var v = val[i];
	            macroTxt += _changeMacroTxt(v);
	        }
	        return macroTxt;
	    };

	    // 매크로 문자 변환 및 관리
	    var _changeMacroTxt = function (txt) {
	        var result = "";

	        switch (txt) {
	            case "[#광고#]":
	                result = "(광고)";
	                break;

	            case "[#송신날짜#]":
	            case "[#발신날짜#]":
	                result = "2017년 12월 31일";
	                break;

	            case "[#현장명#]":
	                result = "현장명입니다.";
	                break;

	            case "[#이벤트명#]":
	                result = "이벤트명입니다.";
	                break;

	            case "[#고객명#]":
	                result = "홍길동";
	                break;

	            case "[#경품명#]":
	                result = "1등 상품 : 아이패드 프로";
	                break;

	            case "[#발신정보#]":
	                result = "※ 문의전화 : 1111-2222";
	                break;

	            case "[#수신거부#]":
	                result = "※ 무료수신거부 010-1111-2222";
	                break;

	            case "[#단지명#]":
	                result = "단지명입니다.";
	                break;

	            case "[#발신시간#]":
	                result = "오전 12시 12분";
	                break;

	            case "[#전일 인바운드 누계#]":
	            case "[#전일 인바운드수#]":
	            case "[#금일 인바운드수#]":
	            case "[#전일 방문상담 누계#]":
	            case "[#전일 방문상담수#]":
	            case "[#금일 방문상담수#]":
	            case "[#전일 방문자 누계#]":
	            case "[#전일 방문자수#]":
	            case "[#금일 방문자수#]":
	                result = "1234567";
	                break;

	            case "[#인바운드 총누계#]":
	            case "[#방문상담 총누계#]":
	            case "[#방문자 총누계#]":
	                result = "12345678";
	                break;

	            default:
	                result = "";
	        }
	        console.log(result)
	        return result;
	    };

	    return _init;
	})();
    
})(MYAPP||{}, jQuery);