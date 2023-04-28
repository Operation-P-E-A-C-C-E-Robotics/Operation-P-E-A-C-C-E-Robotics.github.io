function showAlert(obj){
    var html = `<div class="alert alert-${obj.class} alert-dismissible fade show mt-0 mb-0" id="alertMain">
  <button type="button" class="close" data-dismiss="alert">&times;</button>
  <div id="alertText"><strong>${obj.header}</strong> ${obj.message}</div>
  </div>`;

    $('#alert').append(html);
}