# sms
문자메시지 미리보기, 매크로, 바이트 체크 기능 [2017]

문자 내용을 입력하면 SMS/LMS/MMS와 바이트 수를 확인할 수 있으며 미리 설정해 둔 매크로들을 버튼을 클릭하여 추가할 수 있습니다.

## 사용 방법
resource 폴더에 있는 css/image/js 파일들을 import 합니다.

## 호출 코드
```
MYAPP.messageEdit({
    inputArea: ".input_area",
    viewArea: ".phone",
    macroArea: ".macro"
});
```            
- inputArea: textarea가 존재하는 영역의 class/id 명
- viewArea: 미리보기 영역의 class/id 명
- macroArea: 매크로 버튼 영역의 class/id 명

※ 매크로 내용 수정은 resources/js/front.js 의 196번째 라인, _changeMacroTxt()에서 수정할 수 있습니다.
