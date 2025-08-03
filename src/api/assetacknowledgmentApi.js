export const getAllAssetAcknowledgements = async (req, res) => {
    try {
      const acknowledgements = await AssetAcknowledgement.find()
        .populate("user", "email fname lname userName branch")
        .populate("product", "systemName systemModel productType");
  
      const formatted = acknowledgements.map((item) => ({
        id: item._id,
        email: item.user.email,
        username: item.user.userName,
        firstName: item.user.fname,
        lastName: item.user.lname,
        branch: item.user.branch,
        systemName: item.product.systemName,
        systemModel: item.product.systemModel,
        productType: item.product.productType,
        status: item.status,
        requestDate: item.requestDate,
        responseDate: item.responseDate || "--",
      }));
  
      res.status(StatusCodes.OK).json({ acknowledgements: formatted });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error fetching acknowledgements" });
    }
  };
  