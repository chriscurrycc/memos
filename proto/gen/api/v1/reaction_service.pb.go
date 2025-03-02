// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.5
// 	protoc        (unknown)
// source: api/v1/reaction_service.proto

package apiv1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
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

type Reaction struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	Id    int32                  `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
	// The name of the creator.
	// Format: users/{id}
	Creator       string `protobuf:"bytes,2,opt,name=creator,proto3" json:"creator,omitempty"`
	ContentId     string `protobuf:"bytes,3,opt,name=content_id,json=contentId,proto3" json:"content_id,omitempty"`
	ReactionType  string `protobuf:"bytes,4,opt,name=reaction_type,json=reactionType,proto3" json:"reaction_type,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *Reaction) Reset() {
	*x = Reaction{}
	mi := &file_api_v1_reaction_service_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *Reaction) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Reaction) ProtoMessage() {}

func (x *Reaction) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_reaction_service_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Reaction.ProtoReflect.Descriptor instead.
func (*Reaction) Descriptor() ([]byte, []int) {
	return file_api_v1_reaction_service_proto_rawDescGZIP(), []int{0}
}

func (x *Reaction) GetId() int32 {
	if x != nil {
		return x.Id
	}
	return 0
}

func (x *Reaction) GetCreator() string {
	if x != nil {
		return x.Creator
	}
	return ""
}

func (x *Reaction) GetContentId() string {
	if x != nil {
		return x.ContentId
	}
	return ""
}

func (x *Reaction) GetReactionType() string {
	if x != nil {
		return x.ReactionType
	}
	return ""
}

var File_api_v1_reaction_service_proto protoreflect.FileDescriptor

var file_api_v1_reaction_service_proto_rawDesc = string([]byte{
	0x0a, 0x1d, 0x61, 0x70, 0x69, 0x2f, 0x76, 0x31, 0x2f, 0x72, 0x65, 0x61, 0x63, 0x74, 0x69, 0x6f,
	0x6e, 0x5f, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12,
	0x0c, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x22, 0x78, 0x0a,
	0x08, 0x52, 0x65, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x05, 0x52, 0x02, 0x69, 0x64, 0x12, 0x18, 0x0a, 0x07, 0x63, 0x72, 0x65,
	0x61, 0x74, 0x6f, 0x72, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x63, 0x72, 0x65, 0x61,
	0x74, 0x6f, 0x72, 0x12, 0x1d, 0x0a, 0x0a, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x5f, 0x69,
	0x64, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74,
	0x49, 0x64, 0x12, 0x23, 0x0a, 0x0d, 0x72, 0x65, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x5f, 0x74,
	0x79, 0x70, 0x65, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0c, 0x72, 0x65, 0x61, 0x63, 0x74,
	0x69, 0x6f, 0x6e, 0x54, 0x79, 0x70, 0x65, 0x42, 0xac, 0x01, 0x0a, 0x10, 0x63, 0x6f, 0x6d, 0x2e,
	0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x42, 0x14, 0x52, 0x65,
	0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x50, 0x72, 0x6f,
	0x74, 0x6f, 0x50, 0x01, 0x5a, 0x30, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d,
	0x2f, 0x75, 0x73, 0x65, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2f, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2f,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x67, 0x65, 0x6e, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x76, 0x31,
	0x3b, 0x61, 0x70, 0x69, 0x76, 0x31, 0xa2, 0x02, 0x03, 0x4d, 0x41, 0x58, 0xaa, 0x02, 0x0c, 0x4d,
	0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x41, 0x70, 0x69, 0x2e, 0x56, 0x31, 0xca, 0x02, 0x0c, 0x4d, 0x65,
	0x6d, 0x6f, 0x73, 0x5c, 0x41, 0x70, 0x69, 0x5c, 0x56, 0x31, 0xe2, 0x02, 0x18, 0x4d, 0x65, 0x6d,
	0x6f, 0x73, 0x5c, 0x41, 0x70, 0x69, 0x5c, 0x56, 0x31, 0x5c, 0x47, 0x50, 0x42, 0x4d, 0x65, 0x74,
	0x61, 0x64, 0x61, 0x74, 0x61, 0xea, 0x02, 0x0e, 0x4d, 0x65, 0x6d, 0x6f, 0x73, 0x3a, 0x3a, 0x41,
	0x70, 0x69, 0x3a, 0x3a, 0x56, 0x31, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
})

var (
	file_api_v1_reaction_service_proto_rawDescOnce sync.Once
	file_api_v1_reaction_service_proto_rawDescData []byte
)

func file_api_v1_reaction_service_proto_rawDescGZIP() []byte {
	file_api_v1_reaction_service_proto_rawDescOnce.Do(func() {
		file_api_v1_reaction_service_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_api_v1_reaction_service_proto_rawDesc), len(file_api_v1_reaction_service_proto_rawDesc)))
	})
	return file_api_v1_reaction_service_proto_rawDescData
}

var file_api_v1_reaction_service_proto_msgTypes = make([]protoimpl.MessageInfo, 1)
var file_api_v1_reaction_service_proto_goTypes = []any{
	(*Reaction)(nil), // 0: memos.api.v1.Reaction
}
var file_api_v1_reaction_service_proto_depIdxs = []int32{
	0, // [0:0] is the sub-list for method output_type
	0, // [0:0] is the sub-list for method input_type
	0, // [0:0] is the sub-list for extension type_name
	0, // [0:0] is the sub-list for extension extendee
	0, // [0:0] is the sub-list for field type_name
}

func init() { file_api_v1_reaction_service_proto_init() }
func file_api_v1_reaction_service_proto_init() {
	if File_api_v1_reaction_service_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_api_v1_reaction_service_proto_rawDesc), len(file_api_v1_reaction_service_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   1,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_api_v1_reaction_service_proto_goTypes,
		DependencyIndexes: file_api_v1_reaction_service_proto_depIdxs,
		MessageInfos:      file_api_v1_reaction_service_proto_msgTypes,
	}.Build()
	File_api_v1_reaction_service_proto = out.File
	file_api_v1_reaction_service_proto_goTypes = nil
	file_api_v1_reaction_service_proto_depIdxs = nil
}
