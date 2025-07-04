// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.6
// 	protoc        (unknown)
// source: api/v1/resource_service.proto

package apiv1

import (
	_ "google.golang.org/genproto/googleapis/api/annotations"
	httpbody "google.golang.org/genproto/googleapis/api/httpbody"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	emptypb "google.golang.org/protobuf/types/known/emptypb"
	fieldmaskpb "google.golang.org/protobuf/types/known/fieldmaskpb"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	reflect "reflect"
	sync "sync"
	unsafe "unsafe"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Resource struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The name of the resource.
	// Format: resources/{id}
	// id is the system generated unique identifier.
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	// The user defined id of the resource.
	Uid          string                 `protobuf:"bytes,2,opt,name=uid,proto3" json:"uid,omitempty"`
	CreateTime   *timestamppb.Timestamp `protobuf:"bytes,3,opt,name=create_time,json=createTime,proto3" json:"create_time,omitempty"`
	Filename     string                 `protobuf:"bytes,4,opt,name=filename,proto3" json:"filename,omitempty"`
	Content      []byte                 `protobuf:"bytes,5,opt,name=content,proto3" json:"content,omitempty"`
	ExternalLink string                 `protobuf:"bytes,6,opt,name=external_link,json=externalLink,proto3" json:"external_link,omitempty"`
	Type         string                 `protobuf:"bytes,7,opt,name=type,proto3" json:"type,omitempty"`
	Size         int64                  `protobuf:"varint,8,opt,name=size,proto3" json:"size,omitempty"`
	// The related memo.
	// Format: memos/{id}
	Memo          *string `protobuf:"bytes,9,opt,name=memo,proto3,oneof" json:"memo,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *Resource) Reset() {
	*x = Resource{}
	mi := &file_api_v1_resource_service_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *Resource) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Resource) ProtoMessage() {}

func (x *Resource) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Resource.ProtoReflect.Descriptor instead.
func (*Resource) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{0}
}

func (x *Resource) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Resource) GetUid() string {
	if x != nil {
		return x.Uid
	}
	return ""
}

func (x *Resource) GetCreateTime() *timestamppb.Timestamp {
	if x != nil {
		return x.CreateTime
	}
	return nil
}

func (x *Resource) GetFilename() string {
	if x != nil {
		return x.Filename
	}
	return ""
}

func (x *Resource) GetContent() []byte {
	if x != nil {
		return x.Content
	}
	return nil
}

func (x *Resource) GetExternalLink() string {
	if x != nil {
		return x.ExternalLink
	}
	return ""
}

func (x *Resource) GetType() string {
	if x != nil {
		return x.Type
	}
	return ""
}

func (x *Resource) GetSize() int64 {
	if x != nil {
		return x.Size
	}
	return 0
}

func (x *Resource) GetMemo() string {
	if x != nil && x.Memo != nil {
		return *x.Memo
	}
	return ""
}

type CreateResourceRequest struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Resource      *Resource              `protobuf:"bytes,1,opt,name=resource,proto3" json:"resource,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *CreateResourceRequest) Reset() {
	*x = CreateResourceRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *CreateResourceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateResourceRequest) ProtoMessage() {}

func (x *CreateResourceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateResourceRequest.ProtoReflect.Descriptor instead.
func (*CreateResourceRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{1}
}

func (x *CreateResourceRequest) GetResource() *Resource {
	if x != nil {
		return x.Resource
	}
	return nil
}

type ListResourcesRequest struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ListResourcesRequest) Reset() {
	*x = ListResourcesRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[2]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ListResourcesRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListResourcesRequest) ProtoMessage() {}

func (x *ListResourcesRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[2]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListResourcesRequest.ProtoReflect.Descriptor instead.
func (*ListResourcesRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{2}
}

type ListResourcesResponse struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Resources     []*Resource            `protobuf:"bytes,1,rep,name=resources,proto3" json:"resources,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ListResourcesResponse) Reset() {
	*x = ListResourcesResponse{}
	mi := &file_api_v1_resource_service_proto_msgTypes[3]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ListResourcesResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListResourcesResponse) ProtoMessage() {}

func (x *ListResourcesResponse) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[3]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListResourcesResponse.ProtoReflect.Descriptor instead.
func (*ListResourcesResponse) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{3}
}

func (x *ListResourcesResponse) GetResources() []*Resource {
	if x != nil {
		return x.Resources
	}
	return nil
}

type GetResourceRequest struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The name of the resource.
	// Format: resources/{id}
	// id is the system generated unique identifier.
	Name          string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *GetResourceRequest) Reset() {
	*x = GetResourceRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[4]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *GetResourceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetResourceRequest) ProtoMessage() {}

func (x *GetResourceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[4]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetResourceRequest.ProtoReflect.Descriptor instead.
func (*GetResourceRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{4}
}

func (x *GetResourceRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

type GetResourceByUidRequest struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The uid of the resource.
	Uid           string `protobuf:"bytes,1,opt,name=uid,proto3" json:"uid,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *GetResourceByUidRequest) Reset() {
	*x = GetResourceByUidRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[5]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *GetResourceByUidRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetResourceByUidRequest) ProtoMessage() {}

func (x *GetResourceByUidRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[5]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetResourceByUidRequest.ProtoReflect.Descriptor instead.
func (*GetResourceByUidRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{5}
}

func (x *GetResourceByUidRequest) GetUid() string {
	if x != nil {
		return x.Uid
	}
	return ""
}

type GetResourceBinaryRequest struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The name of the resource.
	// Format: resources/{id}
	// id is the system generated unique identifier.
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	// The filename of the resource. Mainly used for downloading.
	Filename string `protobuf:"bytes,2,opt,name=filename,proto3" json:"filename,omitempty"`
	// A flag indicating if the thumbnail version of the resource should be returned
	Thumbnail     bool `protobuf:"varint,3,opt,name=thumbnail,proto3" json:"thumbnail,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *GetResourceBinaryRequest) Reset() {
	*x = GetResourceBinaryRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[6]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *GetResourceBinaryRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetResourceBinaryRequest) ProtoMessage() {}

func (x *GetResourceBinaryRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[6]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetResourceBinaryRequest.ProtoReflect.Descriptor instead.
func (*GetResourceBinaryRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{6}
}

func (x *GetResourceBinaryRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *GetResourceBinaryRequest) GetFilename() string {
	if x != nil {
		return x.Filename
	}
	return ""
}

func (x *GetResourceBinaryRequest) GetThumbnail() bool {
	if x != nil {
		return x.Thumbnail
	}
	return false
}

type UpdateResourceRequest struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Resource      *Resource              `protobuf:"bytes,1,opt,name=resource,proto3" json:"resource,omitempty"`
	UpdateMask    *fieldmaskpb.FieldMask `protobuf:"bytes,2,opt,name=update_mask,json=updateMask,proto3" json:"update_mask,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *UpdateResourceRequest) Reset() {
	*x = UpdateResourceRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[7]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *UpdateResourceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpdateResourceRequest) ProtoMessage() {}

func (x *UpdateResourceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[7]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpdateResourceRequest.ProtoReflect.Descriptor instead.
func (*UpdateResourceRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{7}
}

func (x *UpdateResourceRequest) GetResource() *Resource {
	if x != nil {
		return x.Resource
	}
	return nil
}

func (x *UpdateResourceRequest) GetUpdateMask() *fieldmaskpb.FieldMask {
	if x != nil {
		return x.UpdateMask
	}
	return nil
}

type DeleteResourceRequest struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The name of the resource.
	// Format: resources/{id}
	// id is the system generated unique identifier.
	Name          string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *DeleteResourceRequest) Reset() {
	*x = DeleteResourceRequest{}
	mi := &file_api_v1_resource_service_proto_msgTypes[8]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *DeleteResourceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DeleteResourceRequest) ProtoMessage() {}

func (x *DeleteResourceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_resource_service_proto_msgTypes[8]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DeleteResourceRequest.ProtoReflect.Descriptor instead.
func (*DeleteResourceRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_resource_service_proto_rawDescGZIP(), []int{8}
}

func (x *DeleteResourceRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

var File_api_v1_resource_service_proto protoreflect.FileDescriptor

const file_api_v1_resource_service_proto_rawDesc = "" +
	"\n" +
	"\x1dapi/v1/resource_service.proto\x12\fmemos.api.v1\x1a\x1cgoogle/api/annotations.proto\x1a\x17google/api/client.proto\x1a\x1fgoogle/api/field_behavior.proto\x1a\x19google/api/httpbody.proto\x1a\x1bgoogle/protobuf/empty.proto\x1a google/protobuf/field_mask.proto\x1a\x1fgoogle/protobuf/timestamp.proto\"\x9e\x02\n" +
	"\bResource\x12\x12\n" +
	"\x04name\x18\x01 \x01(\tR\x04name\x12\x10\n" +
	"\x03uid\x18\x02 \x01(\tR\x03uid\x12A\n" +
	"\vcreate_time\x18\x03 \x01(\v2\x1a.google.protobuf.TimestampB\x04\xe2A\x01\x03R\n" +
	"createTime\x12\x1a\n" +
	"\bfilename\x18\x04 \x01(\tR\bfilename\x12\x1e\n" +
	"\acontent\x18\x05 \x01(\fB\x04\xe2A\x01\x04R\acontent\x12#\n" +
	"\rexternal_link\x18\x06 \x01(\tR\fexternalLink\x12\x12\n" +
	"\x04type\x18\a \x01(\tR\x04type\x12\x12\n" +
	"\x04size\x18\b \x01(\x03R\x04size\x12\x17\n" +
	"\x04memo\x18\t \x01(\tH\x00R\x04memo\x88\x01\x01B\a\n" +
	"\x05_memo\"K\n" +
	"\x15CreateResourceRequest\x122\n" +
	"\bresource\x18\x01 \x01(\v2\x16.memos.api.v1.ResourceR\bresource\"\x16\n" +
	"\x14ListResourcesRequest\"M\n" +
	"\x15ListResourcesResponse\x124\n" +
	"\tresources\x18\x01 \x03(\v2\x16.memos.api.v1.ResourceR\tresources\"(\n" +
	"\x12GetResourceRequest\x12\x12\n" +
	"\x04name\x18\x01 \x01(\tR\x04name\"+\n" +
	"\x17GetResourceByUidRequest\x12\x10\n" +
	"\x03uid\x18\x01 \x01(\tR\x03uid\"h\n" +
	"\x18GetResourceBinaryRequest\x12\x12\n" +
	"\x04name\x18\x01 \x01(\tR\x04name\x12\x1a\n" +
	"\bfilename\x18\x02 \x01(\tR\bfilename\x12\x1c\n" +
	"\tthumbnail\x18\x03 \x01(\bR\tthumbnail\"\x88\x01\n" +
	"\x15UpdateResourceRequest\x122\n" +
	"\bresource\x18\x01 \x01(\v2\x16.memos.api.v1.ResourceR\bresource\x12;\n" +
	"\vupdate_mask\x18\x02 \x01(\v2\x1a.google.protobuf.FieldMaskR\n" +
	"updateMask\"+\n" +
	"\x15DeleteResourceRequest\x12\x12\n" +
	"\x04name\x18\x01 \x01(\tR\x04name2\x98\a\n" +
	"\x0fResourceService\x12r\n" +
	"\x0eCreateResource\x12#.memos.api.v1.CreateResourceRequest\x1a\x16.memos.api.v1.Resource\"#\x82\xd3\xe4\x93\x02\x1d:\bresource\"\x11/api/v1/resources\x12s\n" +
	"\rListResources\x12\".memos.api.v1.ListResourcesRequest\x1a#.memos.api.v1.ListResourcesResponse\"\x19\x82\xd3\xe4\x93\x02\x13\x12\x11/api/v1/resources\x12r\n" +
	"\vGetResource\x12 .memos.api.v1.GetResourceRequest\x1a\x16.memos.api.v1.Resource\")\xdaA\x04name\x82\xd3\xe4\x93\x02\x1c\x12\x1a/api/v1/{name=resources/*}\x12\x7f\n" +
	"\x10GetResourceByUid\x12%.memos.api.v1.GetResourceByUidRequest\x1a\x16.memos.api.v1.Resource\",\xdaA\x03uid\x82\xd3\xe4\x93\x02 \x12\x1e/api/v1/resources:by-uid/{uid}\x12\x8e\x01\n" +
	"\x11GetResourceBinary\x12&.memos.api.v1.GetResourceBinaryRequest\x1a\x14.google.api.HttpBody\";\xdaA\rname,filename\x82\xd3\xe4\x93\x02%\x12#/file/{name=resources/*}/{filename}\x12\x9b\x01\n" +
	"\x0eUpdateResource\x12#.memos.api.v1.UpdateResourceRequest\x1a\x16.memos.api.v1.Resource\"L\xdaA\x14resource,update_mask\x82\xd3\xe4\x93\x02/:\bresource2#/api/v1/{resource.name=resources/*}\x12x\n" +
	"\x0eDeleteResource\x12#.memos.api.v1.DeleteResourceRequest\x1a\x16.google.protobuf.Empty\")\xdaA\x04name\x82\xd3\xe4\x93\x02\x1c*\x1a/api/v1/{name=resources/*}B\xac\x01\n" +
	"\x10com.memos.api.v1B\x14ResourceServiceProtoP\x01Z0github.com/usememos/memos/proto/gen/api/v1;apiv1\xa2\x02\x03MAX\xaa\x02\fMemos.Api.V1\xca\x02\fMemos\\Api\\V1\xe2\x02\x18Memos\\Api\\V1\\GPBMetadata\xea\x02\x0eMemos::Api::V1b\x06proto3"

var (
	file_api_v1_resource_service_proto_rawDescOnce sync.Once
	file_api_v1_resource_service_proto_rawDescData []byte
)

func file_api_v1_resource_service_proto_rawDescGZIP() []byte {
	file_api_v1_resource_service_proto_rawDescOnce.Do(func() {
		file_api_v1_resource_service_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_api_v1_resource_service_proto_rawDesc), len(file_api_v1_resource_service_proto_rawDesc)))
	})
	return file_api_v1_resource_service_proto_rawDescData
}

var file_api_v1_resource_service_proto_msgTypes = make([]protoimpl.MessageInfo, 9)
var file_api_v1_resource_service_proto_goTypes = []any{
	(*Resource)(nil),                 // 0: memos.api.v1.Resource
	(*CreateResourceRequest)(nil),    // 1: memos.api.v1.CreateResourceRequest
	(*ListResourcesRequest)(nil),     // 2: memos.api.v1.ListResourcesRequest
	(*ListResourcesResponse)(nil),    // 3: memos.api.v1.ListResourcesResponse
	(*GetResourceRequest)(nil),       // 4: memos.api.v1.GetResourceRequest
	(*GetResourceByUidRequest)(nil),  // 5: memos.api.v1.GetResourceByUidRequest
	(*GetResourceBinaryRequest)(nil), // 6: memos.api.v1.GetResourceBinaryRequest
	(*UpdateResourceRequest)(nil),    // 7: memos.api.v1.UpdateResourceRequest
	(*DeleteResourceRequest)(nil),    // 8: memos.api.v1.DeleteResourceRequest
	(*timestamppb.Timestamp)(nil),    // 9: google.protobuf.Timestamp
	(*fieldmaskpb.FieldMask)(nil),    // 10: google.protobuf.FieldMask
	(*httpbody.HttpBody)(nil),        // 11: google.api.HttpBody
	(*emptypb.Empty)(nil),            // 12: google.protobuf.Empty
}
var file_api_v1_resource_service_proto_depIdxs = []int32{
	9,  // 0: memos.api.v1.Resource.create_time:type_name -> google.protobuf.Timestamp
	0,  // 1: memos.api.v1.CreateResourceRequest.resource:type_name -> memos.api.v1.Resource
	0,  // 2: memos.api.v1.ListResourcesResponse.resources:type_name -> memos.api.v1.Resource
	0,  // 3: memos.api.v1.UpdateResourceRequest.resource:type_name -> memos.api.v1.Resource
	10, // 4: memos.api.v1.UpdateResourceRequest.update_mask:type_name -> google.protobuf.FieldMask
	1,  // 5: memos.api.v1.ResourceService.CreateResource:input_type -> memos.api.v1.CreateResourceRequest
	2,  // 6: memos.api.v1.ResourceService.ListResources:input_type -> memos.api.v1.ListResourcesRequest
	4,  // 7: memos.api.v1.ResourceService.GetResource:input_type -> memos.api.v1.GetResourceRequest
	5,  // 8: memos.api.v1.ResourceService.GetResourceByUid:input_type -> memos.api.v1.GetResourceByUidRequest
	6,  // 9: memos.api.v1.ResourceService.GetResourceBinary:input_type -> memos.api.v1.GetResourceBinaryRequest
	7,  // 10: memos.api.v1.ResourceService.UpdateResource:input_type -> memos.api.v1.UpdateResourceRequest
	8,  // 11: memos.api.v1.ResourceService.DeleteResource:input_type -> memos.api.v1.DeleteResourceRequest
	0,  // 12: memos.api.v1.ResourceService.CreateResource:output_type -> memos.api.v1.Resource
	3,  // 13: memos.api.v1.ResourceService.ListResources:output_type -> memos.api.v1.ListResourcesResponse
	0,  // 14: memos.api.v1.ResourceService.GetResource:output_type -> memos.api.v1.Resource
	0,  // 15: memos.api.v1.ResourceService.GetResourceByUid:output_type -> memos.api.v1.Resource
	11, // 16: memos.api.v1.ResourceService.GetResourceBinary:output_type -> google.api.HttpBody
	0,  // 17: memos.api.v1.ResourceService.UpdateResource:output_type -> memos.api.v1.Resource
	12, // 18: memos.api.v1.ResourceService.DeleteResource:output_type -> google.protobuf.Empty
	12, // [12:19] is the sub-list for method output_type
	5,  // [5:12] is the sub-list for method input_type
	5,  // [5:5] is the sub-list for extension type_name
	5,  // [5:5] is the sub-list for extension extendee
	0,  // [0:5] is the sub-list for field type_name
}

func init() { file_api_v1_resource_service_proto_init() }
func file_api_v1_resource_service_proto_init() {
	if File_api_v1_resource_service_proto != nil {
		return
	}
	file_api_v1_resource_service_proto_msgTypes[0].OneofWrappers = []any{}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_api_v1_resource_service_proto_rawDesc), len(file_api_v1_resource_service_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   9,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_api_v1_resource_service_proto_goTypes,
		DependencyIndexes: file_api_v1_resource_service_proto_depIdxs,
		MessageInfos:      file_api_v1_resource_service_proto_msgTypes,
	}.Build()
	File_api_v1_resource_service_proto = out.File
	file_api_v1_resource_service_proto_goTypes = nil
	file_api_v1_resource_service_proto_depIdxs = nil
}
