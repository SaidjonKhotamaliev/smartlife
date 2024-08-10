console.log("Signup frontend javascript file");

$(function () {
  const fileTarget = $(".file-box .upload-hidden");
  let fileName;

  fileTarget.on("change", function () {
    if (window.FileReader) {
      const uploadFile = $(this)[0].files[0],
        fileType = uploadFile["type"],
        validImageType = ["image/jpg", "image/jpeg", "image/png"];
      if (!validImageType.includes(fileType)) {
        alert("Please insert only jpg, jpeg or png formats!");
      } else {
        if (uploadFile) {
          console.log(URL.createObjectURL(uploadFile));
          $(".upload-img-frame")
            .attr("src", URL.createObjectURL(uploadFile))
            .addClass("success");
        }
        fileName = uploadFile.name;
      }
      $(this).siblings(".upload-name").val(fileName);
    }
  });
});

function validateSignUpForm() {
  const memberNick = $(".member-nick").val(),
    memberPhone = $(".member-phone").val(),
    memberPassword = $(".member-password").val(),
    memberConfirmPassword = $(".confirm-password").val();

  if (
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    memberConfirmPassword === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  }

  if (memberPassword !== memberConfirmPassword) {
    alert("Password differs, please check!");
    return false;
  }

  const memberImage = $(".member-image").get(0).files[0]?.name
    ? $(".member-image").get(0).files[0].name
    : null;
  if (!memberImage) {
    alert("Please insert restaurant image!");
    return false;
  }
}
