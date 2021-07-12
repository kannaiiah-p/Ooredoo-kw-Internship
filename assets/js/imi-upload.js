app.controller('GrandFinaleController', ['$scope', function ($scope) {
    $scope.UpdatedComments = [];
    $scope.userblocked = false;
    $scope.hideCommentSection = true;

    function checkusersession() {

        var userid = localStorage.grandfilemsisdn;
        if (userid === "undefined" || userid === undefined) userid = '';

        var sessionid = localStorage.grandfilesessionid;
        if (sessionid === "undefined" || sessionid === undefined) sessionid = '';
        if (userid === '' || sessionid === '') {

            var lMsisdn = localStorage.msisdn;
            if (lMsisdn === undefined || lMsisdn === '' || lMsisdn === null)
                lMsisdn = '';

            var lMsisdnT = localStorage.usertype;
            if (lMsisdnT === undefined || lMsisdnT === '' || lMsisdnT === null)
                lMsisdnT = '';

            if (lMsisdn === '') {
                $('#Modal-SGF-form').modal('show');
                $('#btn_comment_add').attr('disabled', true);
                $('#logout_finale').hide();
                $('#grandFinaleLive').hide();
                return false;
            }
            else {
                $('#grandFinaleLive').show();
                $('#logout_finale').show();
                var dataInput = {
                    name: '',
                    // usertype: $('#txt_sgf_name').val(),
                    msisdn: lMsisdn,
                    UserType: lMsisdnT === "0" ? "student" : "parent"
                };
                GrandFinaleSubmit(dataInput, true);
            }
        }
        else {
            $('#btn_comment_add').attr('disabled', false);
            $('#logout_finale').show();
            $('#grandFinaleLive').show();
            loadComments();
        }
    }

    $("#btn_banner_sgf").click(function () {
        checkusersession();
    });

    //$("body").delegate("#btn_sgf_submit", "click", function () {
    //    $('#Modal-SGF-form').modal('show');
    //});

    $('#btn_sgf_submit').click(function () {
        if ($('#txt_sgf_msisdn').val() === undefined || $('#txt_sgf_msisdn').val() === null || $('#txt_sgf_msisdn').val() === "") {
            ShowError('Modal-Error-SGF', 'lbl_sgf_err_msg', 'Please Enter mobile number');
            $('#Modal-SGF-form').modal('hide');
            return '';
        }

        var msisdn = $('#txt_sgf_msisdn').val();

        if (msisdn.substring(0, 1) === "0") {
            msisdn = "234" + msisdn.replace(msisdn.charAt(0), "")
        }
        else if (msisdn.substring(0, 3) !== "234") {
            msisdn = "234" + msisdn;
        }

        if (msisdn.length !== 13) {
            ShowError('Modal-Error-SGF', 'lbl_sgf_err_msg', 'Please Enter Valid mobile number');
            $('#Modal-SGF-form').modal('hide');
            return;
        }

        if ($('#txt_sgf_name').val() === "" || $('#txt_sgf_name').val() === undefined || $('#txt_sgf_name').val() === null) {
            ShowError('Modal-Error-SGF', 'lbl_sgf_err_msg', 'Please Enter Name');
            $('#Modal-SGF-form').modal('hide');
            return '';
        }

        //var selected = $('input[name=thename]:checked');
        //if (selected.length > 0) {
        //    ShowError('Modal-Error-SGF', 'lbl_sgf_err_msg', 'Please Select usertype.');
        //    return '';
        //}

        var sUsertype = "";

        sUsertype = $('.sgfusertype:checked').val();

        if (sUsertype === "" || sUsertype === undefined || sUsertype === null) {
            ShowError('Modal-Error-SGF', 'lbl_sgf_err_msg', 'Please Select usertype.');
            $('#Modal-SGF-form').modal('hide');
            return false;
        }

        GrandFinaleSubmit();
    });

    //$('#btnFailModalClicked').click(function () {
    //    $('#Modal-Blogs-Error').modal('hide');
    //});

    $('#btn_comment_add').click(function () {
        $scope.addComment();
    });

    function ShowError(id, err_id, msg) {
        $('#' + id).modal('show');
        $('#' + err_id).text(msg);
    }

    function GrandFinaleSubmit(dataFrmExt, isDirect) {
        if (!isDirect) {

            var sUsertype = "";
            sUsertype = $('.sgfusertype:checked').val();

            if (sUsertype === "" || sUsertype === undefined || sUsertype === null) {
                ShowError('Modal-Error-SGF', 'lbl_sgf_err_msg', 'Please Select usertype.');
                return false;
            }

            var msisdn = $('#txt_sgf_msisdn').val();
            if (msisdn.substring(0, 3) !== "234") {
                msisdn = "234" + msisdn;
            }

            var dataInput = {
                name: $('#txt_sgf_name').val(),
                // usertype: $('#txt_sgf_name').val(),
                msisdn: msisdn,
                UserType: sUsertype === undefined || sUsertype === "" ? "Student" : sUsertype
            };
        }
        $.ajax({
            url: '/api/spellbee/grandfinalesession',
            type: 'post',
            data: isDirect ? JSON.stringify(dataFrmExt) : JSON.stringify(dataInput),
            cache: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
            async: false,
            success: function (result) {
                hideProcess();
                if (result !== null) {
                    if (result.Status === "1") {
                        localStorage.setItem("grandfilesessionid", result.Data);
                        localStorage.setItem("grandfilemsisdn", result.Msisdn);
                        window.location = "../home/grandfinale";
                    }
                    else if (result.Status === "0") {
                        $scope.userblocked = true;
                    }
                    else if (result.Status === "-1") {
                        $('#lbl_sgf_err_msg').text(result.Message);
                        $('#Modal-SGF-form').modal('hide');
                        $('#Modal-Error-SGF').modal('show');
                    }
                    else if (result.Status === "-2") {
                        $('#lbl_sgf_err_msg').text(result.Message);
                        $('#Modal-SGF-form').modal('hide');
                        $('#Modal-Error-SGF').modal('show');
                    }
                    else if (result.Status === "-3") {
                        $('#lbl_sgf_err_msg').text(result.Message);
                        $('#Modal-SGF-form').modal('hide');
                        $('#Modal-Error-SGF').modal('show');
                    }
                }
            },
            error: function (err) {
                hideProcess();
            }
        });

    }

    $scope.addComment = function () {

        var gmsisdn = localStorage.grandfilemsisdn;
        var gsession = localStorage.grandfilesessionid;

        if (gmsisdn === undefined || gmsisdn === null || gmsisdn === ""
            || gsession === undefined || gsession === null || gsession === "") {
            $('#Modal-SGF-form').modal('show');
            $('#btn_comment_add').attr('disabled', true);
            return false;
        }

        var comment = $('#txt_comment_spellbee').val();
        if (comment === undefined || comment === null || comment === "") {
            return false;
        }

        var dataInput = {
            comment: $('#txt_comment_spellbee').val(),
            msisdn: localStorage.grandfilemsisdn,
            sessionid: localStorage.grandfilesessionid,
        };

        $.ajax({
            url: '/api/spellbee/addcomment',
            type: 'post',
            data: JSON.stringify(dataInput),
            cache: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
            async: false,
            success: function (result) {
                hideProcess();
                if (result !== null) {
                    if (result.Status === "1") {
                        $('#txt_comment_spellbee').val('');
                        loadComments();
                        // window.location = "../home/grandfinale";
                    }
                    else if (result.Status === "0") {
                        $scope.userblocked = true;
                    }
                    else if (result.Status === "-1") {
                        $('#lbl_sgf_err_msg').text(result.Message);
                        $('#Modal-SGF-form').modal('hide');
                        $('#Modal-Error-SGF').modal('show');
                    }
                    else if (result.Status === "-2") {
                        $('#lbl_sgf_err_msg').text(result.Message);
                        $('#Modal-SGF-form').modal('hide');
                        $('#Modal-Error-SGF').modal('show');
                    }
                    else if (result.Status === "-3") {
                        $('#lbl_sgf_err_msg').text(result.Message);
                        $('#Modal-SGF-form').modal('hide');
                        $('#Modal-Error-SGF').modal('show');
                    }
                }
            },
            error: function (err) {
                hideProcess();
            }
        });

    }

    function loadComments() {

        var dataInput = {
            sessionid: localStorage.grandfilesessionid,
            msisdn: localStorage.grandfilemsisdn
            // UserType: sUsertype
        };

        $.ajax({
            url: '/api/spellbee/getcommentsforuser',
            type: 'post',
            data: JSON.stringify(dataInput),
            cache: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
            async: false,
            success: function (result) {
                hideProcess();
                if (result !== null && result.Status === "1") {
                    $scope.UpdatedComments = result.Data;

                    setTimeout(function () {
                        loadComments();
                    }, 10000);
                }
            },
            error: function (err) {
                console.log('updated comment.....er', err);
                hideProcess();
            }
        });

    }

    $('#logout_finale').click(function () {
        window.localStorage.clear();
        window.location = '../../home/index';
    });

    //$("#Modal-Error-SGF").on('hide.bs.modal', function () {
    //    localStorage.clear();
    //    window.location = '../../home/index';
    //});

    function showProcess() {
        document.querySelector('.loader').removeAttribute('hidden');
    };

    function hideProcess() {
        document.querySelector('.loader').setAttribute('hidden', true);
    };

    checkusersession();

}]);

function GetQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
            return sParameterName[1];
    }
}

//$('.sgfusertype').on('change', function () {
//    $('.sgfusertype').not(this).prop('checked', false);
//});
$(document).on('click', 'input[type="checkbox"]', function () {
    $('input[type="checkbox"]').not(this).prop('checked', false);
});

//$("#sgfusertype input[type=checkbox]").click(function () {
//    if ($(this).is(":checked")) {
//        $(".sgfusertype input[type=checkbox]").removeAttr("checked");
//        $(this).attr("checked", "checked");
//    }
//});
