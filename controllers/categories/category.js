const categoryModel = require("../../models/category")

module.exports.addCategory = async (req, res) => {
    try{

        const {title, description, image} = req.body;

        if(!title || !description) return res.send("Fields are empty")

        let category = new categoryModel(req.body)
        category.save()

        return res.json({
            success : true,
            message : "تم اضافه الفئة بنجاح",
            data : category
        })

    }catch(error){
        return res.send(error.message)
    }
}

module.exports.getCategories = async (req, res) => {
    try{

        const categories = await categoryModel.find();
        const categoriesCount = await categoryModel.find().count();

        return res.json({
            success : true,
            status : 400,
            message : "قائمة بجميع الفئات",
            categories,
            count : categoriesCount
        })

    }catch(error){
        return res.send(error.message)
    }
}


module.exports.updateCategory = async (req, res) => {
    try{

        const {title, description, image} = req.body;
        const {id} = req.query;

        // check if product exist with the given product id
        const category = await categoryModel.findOne({_id : id})

        if(category){
            const updatedCategory = await categoryModel.findOneAndUpdate({_id : id}, req.body, {new :true})

            return res.json({
                success : true,
                status : 200,  
                message : "تم تحديث الفئة بنجاح",
                data : updatedCategory
            })
        }else{
            
            return res.json({
                success : false,
                status : 400,
                message : "الفئة غير موجودة"
            })

        }

    }catch(error){
        return res.send(error.message)
    }
}

module.exports.deleteCategory = async (req, res) => {
    try{

        const {id} = req.query;
        
        // check if product exist with the given product id
        const category = await categoryModel.findOneAndDelete({_id : id})
        if(!category){
            return res.json({
                success : false,
                message : "الفئة غير موجودة",
            })
        }
        return res.json({
            success : true,
            message : "تم حذف الفئة بنجاح",
        })

    }catch(error){
        return res.send(error.message)
    } 
}


