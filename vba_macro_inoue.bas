Option Explicit

Private Function SanitizeFileName(ByVal s As String) As String
    Dim illegal As Variant, ch As Variant
    illegal = Array("\", "/", ":", "*", "?", """", "<", ">", "|")
    s = Trim$(s)

    For Each ch In illegal
        s = Replace$(s, ch, "_")
    Next ch

    s = Replace$(s, vbCr, "")
    s = Replace$(s, vbLf, "")
    SanitizeFileName = s
End Function

Private Function GetTemplatePath(ByVal painSite As String) As String
    Dim basePath As String
    basePath = "\\dataserver\rehabilitation-ka\gairai\総計\桑島　担当 -\マクロテンプレート\"

    Select Case painSite
        Case "右肩": GetTemplatePath = basePath & "右肩.xlsx"
        Case "右股関節": GetTemplatePath = basePath & "右股関節.xlsx"
        Case "右手": GetTemplatePath = basePath & "右手.xlsx"
        Case "右足": GetTemplatePath = basePath & "右足.xlsx"
        Case "右膝": GetTemplatePath = basePath & "右膝.xlsx"
        Case "頚部": GetTemplatePath = basePath & "頚部.xlsx"
        Case "腰": GetTemplatePath = basePath & "腰.xlsx"
        Case "左肩": GetTemplatePath = basePath & "左肩.xlsx"
        Case "左股関節": GetTemplatePath = basePath & "左股関節.xlsx"
        Case "左手": GetTemplatePath = basePath & "左手.xlsx"
        Case "左足": GetTemplatePath = basePath & "左足.xlsx"
        Case "左膝": GetTemplatePath = basePath & "左膝.xlsx"
        Case Else: GetTemplatePath = vbNullString
    End Select
End Function

Public Sub 作成_総合実施計画書_最新患者のみ_井上担当()
    Dim ws As Worksheet
    Dim wbTemplate As Workbook
    Dim lastRow As Long
    Dim templatePath As String
    Dim savePath As String
    Dim fullPath As String
    Dim patientID As String
    Dim patientName As String
    Dim diagnosis As String
    Dim gender As String
    Dim birthYear As String
    Dim startDate As Variant
    Dim rehabStartDate As Variant
    Dim doctorName As String
    Dim painSite As String
    Dim fileName As String

    Set ws = ThisWorkbook.Sheets("新患")

    lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
    If lastRow < 12 Then
        MsgBox "B12以降にデータがありません。", vbExclamation
        Exit Sub
    End If

    patientID = CStr(ws.Cells(lastRow, "B").Value)
    patientName = CStr(ws.Cells(lastRow, "C").Value)
    startDate = ws.Cells(lastRow, "D").Value
    doctorName = CStr(ws.Cells(lastRow, "E").Value)
    diagnosis = CStr(ws.Cells(lastRow, "F").Value)
    gender = CStr(ws.Cells(lastRow, "H").Value)
    birthYear = CStr(ws.Cells(lastRow, "I").Value)
    rehabStartDate = ws.Cells(lastRow, "J").Value
    painSite = CStr(ws.Cells(lastRow, "K").Value)

    templatePath = GetTemplatePath(painSite)
    If templatePath = vbNullString Then
        MsgBox "疼痛部位「" & painSite & "」に対応するテンプレートが見つかりません。", vbCritical
        Exit Sub
    End If

    If Dir$(templatePath) = vbNullString Then
        MsgBox "テンプレートが見つかりません：" & vbCrLf & templatePath, vbCritical
        Exit Sub
    End If

    Select Case doctorName
        Case "阪本"
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\1番阪本\"
        Case "小川"
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\3番小川\"
        Case "香川", "鎌田", "本間"
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\4番鎌田、香川、本間\"
        Case "八木"
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\5番八木\"
        Case "岡田"
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\6番岡田\"
        Case "畠山"
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\7番畠山\"
        Case Else
            savePath = "\\dataserver\rehabilitation-ka\gairai\総計\井上　担当\2番その他\"
    End Select

    Set wbTemplate = Workbooks.Open(templatePath)

    With wbTemplate.Sheets(1)
        .Range("D1").Value = patientID
        .Range("F2").Value = patientName
        .Range("B4").Value = diagnosis
        .Range("U2").Value = gender
        .Range("Z2").Value = birthYear
        .Range("H81").Value = doctorName

        If IsDate(startDate) Then
            .Range("AN3").Value = Year(CDate(startDate))
            .Range("AR3").Value = Month(CDate(startDate))
            .Range("AU3").Value = Day(CDate(startDate))
        Else
            .Range("AN3").ClearContents
            .Range("AR3").ClearContents
            .Range("AU3").ClearContents
        End If

        If IsDate(rehabStartDate) Then
            .Range("AN4").Value = Year(CDate(rehabStartDate))
            .Range("AR4").Value = Month(CDate(rehabStartDate))
            .Range("AU4").Value = Day(CDate(rehabStartDate))
        Else
            .Range("AN4").ClearContents
            .Range("AR4").ClearContents
            .Range("AU4").ClearContents
        End If
    End With

    fileName = SanitizeFileName(patientName)
    If fileName = vbNullString Then fileName = "患者_" & patientID
    fileName = fileName & ".xlsx"
    fullPath = savePath & fileName

    Application.DisplayAlerts = False
    On Error GoTo SaveErr
    wbTemplate.SaveAs Filename:=fullPath, FileFormat:=xlOpenXMLWorkbook
    wbTemplate.Close SaveChanges:=False
    Application.DisplayAlerts = True

    Workbooks.Open fullPath

    MsgBox "最新患者の総合実施計画書を作成し保存しました。" & vbCrLf & _
           "保存先：" & fullPath, vbInformation
    Exit Sub

SaveErr:
    Application.DisplayAlerts = True
    MsgBox "保存中にエラーが発生しました：" & vbCrLf & Err.Number & " - " & Err.Description, vbCritical
    If Not wbTemplate Is Nothing Then wbTemplate.Close SaveChanges:=False
End Sub
