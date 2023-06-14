$(document).ready(function () {
    let now = new Date();
    let inv_date = $("#invoice-date").flatpickr({
        defaultDate: now,
        enableTime: false,
        dateFormat: "d.m.Y",
        locale: "tr",
    });

    $("#get-invoices").click(function () {
        Swal.fire({
            title: "Emin misiniz?",
            text: `${inv_date.selectedDates[0].toLocaleDateString()} tarihli faturalar alınacak.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Evet",
            cancelButtonText: "Hayır",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Faturalar Alınıyor",
                    html: `<div class="spinner-border text-primary" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                            <p class="mt-2">Bu işlem biraz zaman alabilir.</p>`,
                    icon: "info",
                    showCancelButton: false,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                });
                $.ajax({
                    url:
                        "/send/" +
                        inv_date.formatDate(inv_date.selectedDates[0], "Y-m-d"),
                    method: "GET",
                    success: function (data) {
                        data.forEach((invoice) => {
                            $("#invoice-list tbody").append(`
                                <tr>
                                    <td>${invoice.document.External.RefNo}</td>
                                    <td>${invoice.document.IssueDateTime}</td>
                                    <td>${
                                        invoice.status == "error"
                                            ? JSON.stringify(
                                                  invoice.error
                                              ).includes("Unique constraint")
                                                ? `<span class="badge bg-warning">Eski Fatura</span>`
                                                : `<span class="badge bg-danger">Hatalı</span>`
                                            : `<span class="badge bg-success">Başarılı</span>`
                                    }</td>
                                    <td>${
                                        invoice.error
                                            ? JSON.stringify(
                                                  invoice.error
                                              ).includes("Unique constraint")
                                                ? "Fatura daha önce gönderilmiş."
                                                : invoice.error
                                            : ""
                                    }</td>
                                </tr>`);
                        });
                        Swal.fire({
                            title: "Faturalar Taslaklara Gönderildi!",
                            icon: "info",
                            html: `
                            <p><b class="text-danger">${
                                data.filter((x) => x.status == "error").length
                            }</b> adet fatura <b class="text-danger">hatalı</b> olduğu için taslaklara gönderilemedi.</p>
                            <p><b class="text-success">${
                                data.filter((x) => x.status == "success").length
                            }</b> adet fatura <b class="text-success">başarıyla</b> taslaklara gönderildi.</p>
                            `,
                            showCancelButton: false,
                            showConfirmButton: true,
                            confirmButtonText: "Tamam",
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: false,
                        });
                    },
                    error: function (err) {
                        Swal.fire({
                            title: "Hata",
                            text: "Bir hata oluştu." + err,
                            icon: "error",
                        });
                    },
                });
            }
        });
    });
});
