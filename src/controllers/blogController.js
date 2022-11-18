const blogModel = require("../models/blogModel")
const Valid = require("../validations/validator")
const { isValidObjectId } = require("mongoose")
const authorModel = require("../models/authorModel")


//++++++++++++++++++++++++++++++++++++++++++  Blog  Creation  ++++++++++++++++++++++++++

const createBlog = async function (req, res) {

    try {
        const requestBody = req.body
        const { title, body, authorId, tags, category, isPublished, publishedAt } = requestBody

        if (!Valid.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: " Pls Provide requestBody" })
        }
        if (!Valid.isValid(title)) {
            return res.status(400).send({ status: false, msg: " Pls Provide title for blog" })
        }
        if (!Valid.isValid(body)) {
            return res.status(400).send({ status: false, msg: "Body is Mandtory" })
        }
        if (!Valid.isValid(tags)) {
            return res.status(400).send({ status: false, msg: "Pls provide tags of blog" })
        }
        if (!Valid.isValid(category)) {
            return res.status(400).send({ status: false, msg: "pls provide category of Blog" })
        }

        if (!Valid.isValid(authorId)) {
            return res.status(400).send({ status: false, msg: " Pls provide author Id" })
        }

        const Id = req.body.authorId
        if (!isValidObjectId(Id)) {
            return res.status(400).send({ status: false, msg: " Pls provide Valid author Id" })
        }

        const validId = await authorModel.findById(Id)
        if (validId) {
            const blogCreated = await blogModel.create(requestBody)
            return res.status(201).send({ status: true, msg: 'blog created succesfully ', data: blogCreated })

        } else { res.status(400).send({ statusbar: false, msg: 'invalid authorid' }) }
    }

    catch (err) {

        return res.status(500).send({ status: false, msg: err.msg })

    }


}



//++++++++++++++++++++++++++++++++  Fetching Blogs  ++++++++++++++++++++++++++++++++++++++++++++++

const filterBlogs = async function (req, res) {


   try {
        let queryData =(req.query.category || req.query.authorId || req.query.tags || req.query.subCategory)

        if (!queryData){
            return res.status(404).send({status:false,msg:"You can only fetch the blogs with authorId,category,tags,subCategory only"})
        } else{
            let authorId = req.query.authorId
            let tags = req.query.tags
            let category = req.query.category
            let subCategory = req.query.subCategory

            let obj = {}
            if (authorId) {
                obj.authorId = authorId
            }
            if (tags) {
                obj.tags = tags
            }
            if (category) {
                obj.category = category
            }
            if (subCategory) {
                obj.subCategory = subCategory
            }

            obj.isDeleted = false
          

            let data = await blogModel.findOne(obj)
            if (data) {
                return res.status(200).send({ status: true, data: data })

            }
           else {
                return res.status(404).send({ status: false, msg: "The given data doesn't found" })
            }
           

         } 
     }
    
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }

}


const allBlogs = async function (req, res) {


    try {
        
 
             let obj = {}
           
             obj.isDeleted = false
            obj.isPublished=true
 
             let data = await blogModel.findOne(obj)
             if (data) {
                 return res.status(200).send({ status: true, data: data })
 
             }
            else {
                 return res.status(404).send({ status: false, msg: "The given data doesn't found" })
             }
            
 
          } 
      
     
     catch (error) {
         res.status(500).send({ status: false, error: error.message });
     }
 
 }
 
 
 
//+++++++++++++++++++++++++  Updating Blogs +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const updateBlog = async function (req, res) {

    try {


        const blogId = req.params.blogId
        
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: " Pls provide Valid blog Id" })
        }
        const checkId = await blogModel.findById(blogId)
        if (checkId) {

            const requestBody = req.body

            const { title, body, tags, subCategory, isPublished } = requestBody

            if (!Valid.isValidRequestBody(requestBody)) {
                return res.status(400).send({ status: false, msg: " Pls Provide requestBody" })
            }
            if (!Valid.isValid(title)) {
                return res.status(400).send({ status: false, msg: " Pls Provide title for blog" })
            }
            if (!Valid.isValid(body)) {
                return res.status(400).send({ status: false, msg: "Body is Mandtory" })
            }
            if (!Valid.isValid(tags)) {
                return res.status(400).send({ status: false, msg: "Pls provide tags of blog" })
            }
            if (!Valid.isValid(subCategory)) {
                return res.status(400).send({ status: false, msg: "Pls provide subCategory of blog" })
            }
            if (!Valid.isValid(isPublished)) {
                return res.status(400).send({ status: false, msg: "Pls provide  blog is published or not " })
            }

            let savedData = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, { $push: { tags: tags, subCategory: subCategory }, title: title, body: body, isPublished: isPublished, publishedAt: Date.now() }, { new: true })

            res.status(200).send({ status: true, msg: "blog updated successfuly", data: savedData })


                                 
        } else {
            return res.status(404).send({ status: false, msg: "blog id does not exist " })
        }

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }



}


//+++++++++++++++++++++++++++++++ Blog Deletion with Blog Id +++++++++++++++++++++++++++++++++++++++++++++++

const blogDeletionById = async function (req, res) {
    try {
        let blogId = req.params.blogId


        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: " Pls provide Valid blog Id" })
        }
            const findingBlog = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: Date.now() } })
            res.status(200).send({ status: true, msg: "Blog is Deleted successfully " })
    
        if (!findingBlog){
            return res.status(404).send({status:false,msg:"blog IDdoesnt exists"})
        }

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}
 
//++++++++++++++++++++++++++++++++++++++ Blog Deletion with QueryParams +++++++++++++++++++++++++++++++++++++++
const deleteBlog = async function (req, res) {
    try {
        let queryData =(req.query.category || req.query.authorId || req.query.tags || req.query.subCategory)

        if (!queryData){
            return res.status(404).send({status:false,msg:"You can only Delete blog  by category, authorid, tag name, subcategory name,or unpublished  blog"})
        } else
        {

            let authorId = req.query.authorId
            let category = req.query.category
            let tags = req.query.tags
            let subCategory = req.query.subCategory
            let isPublished = req.query.isPublished

            let obj = {};
            if (authorId) {
                obj.authorId = authorId;
            }
            if (category) {
                obj.category = category
            }

            if (tags) {
                obj.tags = tags
            }
            if (subCategory) {
                obj.subcategory = subCategory
            }
            if (isPublished) {
                obj.isPublished = isPublished
            }
            obj.isDeleted = false
            obj.isPublished =false

            let data = await blogModel.findOne(obj);
          
        
        if (data) {
            await blogModel.updateMany({ obj }, { isDeleted: true, deletedAt: Date.now() } )

                return res.status(200).send({ status: true, msg: "Blog Deleted succesfully" })
        }

        else {
               
            } return res.status(404).send({ status: false, msg: "The given data is Invalid or blog is already deleted" });
        
        }
    }


    catch (error) {
      return   res.status(500).send({ message: "Failed", error: error.message });
    }
}


module.exports = { createBlog,filterBlogs, updateBlog, blogDeletionById ,deleteBlog ,allBlogs}





