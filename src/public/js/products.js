console.log("Products frontend javascript file");

$(function () {
  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  $(".new-product-status").on("change", async (e) => {
    const id = e.target.id,
      productStatus = $(`#${id}.new-product-status`).val();

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productStatus: productStatus,
      });
      const result = response.data;
      if (result) {
        console.log("Product updated!");
        $(".new-product-status").blur();
      } else alert("Product update failed!");
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".product-sale-btn").on("click", async (e) => {
    const id = e.target.id,
      productStatus = $(`#${id}.new-product-status`).val(),
      productOnSale = $(`#${id}.product-sale-input`).val();

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productOnSale: productOnSale,
        productStatus: productStatus,
      });
      const result = response.data;
      if (result) {
        console.log("Product updated!");
        location.reload();
      } else alert("Product update failed!");
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".product-sale-input").on("keypress", async (e) => {
    if (event.which === 13) {
      const id = e.target.id,
        productStatus = $(`#${id}.new-product-status`).val(),
        productOnSale = $(`#${id}.product-sale-input`).val();

      try {
        const response = await axios.post(`/admin/product/${id}`, {
          productOnSale: productOnSale,
          productStatus: productStatus,
        });
        const result = response.data;
        if (result) {
          console.log("Product updated!");
          location.reload();
        } else alert("Product update failed!");
      } catch (err) {
        console.log(err);
        alert("Product update failed!");
      }
    }
  });
});

function validateForm() {
  const productName = $(".product-name").val(),
    productPrice = $(".product-price").val(),
    productLeftCount = $(".product-left-count").val(),
    productCollection = $(".product-collection").val(),
    productDesc = $(".product-desc").val(),
    productStatus = $(".product-status").val();

  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""
  ) {
    alert("Please insert all details");
    return false;
  } else return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;

  const file = $(`.${imgClassName}`).get(0).files[0],
    fileType = file["type"],
    validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpg, jpeg or png formats!");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
